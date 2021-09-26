<?php

class s9y2blogger {

    private $database = NULL;
    private $errors = array();
    private $curEntry = array(); // current entry of the parser
    private $inPublished = false;

    public function __construct() {
        if(isset($_POST['database'])) {
            // do export
            $port = $this->getOption('port');
            if($port) $port = "port=$port;";
            $dsn = "mysql:host={$this->getOption('host')};{$port}dbname={$this->getOption('database')}";
            try {
                $this->database = new PDO($dsn, $this->getOption('user'), $this->getOption('password'));
            } catch(PDOException $e) {
                $this->abort('Database connection failed: '.$e->getMessage());
            }
            $this->database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            try {
                if ($this->getOption('format') == 'blogger') {
                    $this->printExport($this->getOption('offset'), $this->getOption('limit'));
                } else {
                    $this->printRedirects();
                }
            } catch(PDOException $e) {
                $this->abort('Export failed in database query: '.$e->getMessage());
            }

        } else {
            $this->printHtml();
        }
    }

    private function printExport($offset, $limit) {
        $posts = $this->getPosts($offset, $limit);
        ob_start();
        $this->printXmlHeader();
        $prefix = $this->getOption('prefix');
        /** @var $categories PDOStatement */
        $categories = $this->database->prepare("select category_name from {$prefix}category inner join {$prefix}entrycat as ec on ec.categoryid = {$prefix}category.categoryid where ec.entryid = ?");
        /** @var $tags PDOStatement */
        $tags = $this->database->prepare("select tag from {$prefix}entrytags where entryid = ?");
        /** @var $comments PDOStatement */
        $comments = $this->database->prepare("select author, id, email, url, body, title, type, timestamp, entry_id, parent_id from {$prefix}comments where entry_id = ? and status = 'approved'");
        while ($post = $posts->fetch(PDO::FETCH_OBJ)) {
            $categories->execute(array($post->id));
            $tags->execute(array($post->id));
            $this->printPost($post, $categories, $tags);
            $comments->execute(array($post->id));
            while ($comment = $comments->fetch(PDO::FETCH_OBJ)) {
                $this->printComment($comment);
            }
            $comments->closeCursor();
            $categories->closeCursor();
            $tags->closeCursor();
        }
        $this->printXmlFooter();
        header('Content-Type: text/xml;charset=utf-8');
        header('Content-Disposition: attachment;filename=blogger.xml');
        ob_end_flush();
    }


    private function getPosts($offset, $limit) {
        $offset = (int)$offset;
        $limit = (int)$limit;
        $prefix = $this->getOption('prefix');
        /** @var $statement PDOStatement */
        $statement = $this->database->prepare("select id, timestamp, authorid, author, last_modified, title, body, extended, isdraft, permalink from {$prefix}entries left join {$prefix}permalinks on entry_id = id where {$prefix}permalinks.type = 'entry' limit {$limit} offset {$offset}");
        $statement->execute();
        return $statement;
    }

    public function printRedirects() {
        ob_start();
        echo "RewriteEngine on\n\n";
        $parser = xml_parser_create('UTF-8');
        xml_set_element_handler($parser, array($this, 'parseElement'), array($this, 'parseCloseElement'));
        xml_set_character_data_handler($parser, array($this, 'parseCdata'));
        if (!xml_parse($parser, file_get_contents($_FILES['export']['tmp_name']))) {
            $this->abort(xml_error_string(xml_get_error_code($parser)));
        }
        header('Content-Type: text/plain;charset=utf-8');
        header('Content-Disposition: attachment;filename=htaccess.txt');
        ob_end_flush();
    }

    public function parseElement($parser, $name, $attribs) {
        if ($name == 'CATEGORY' && $attribs['SCHEME'] == 'http://schemas.google.com/g/2005#kind') {
            if ($attribs['TERM'] == 'http://schemas.google.com/blogger/2008/kind#post') {
                $this->curEntry['type'] = 'post';
            } else {
                $this->curEntry['type'] = 'comment';
            }
        } elseif ($name == 'LINK' && $attribs['REL'] == 'alternate' && $attribs['TYPE'] == 'text/html' && isset($attribs['TITLE'])) {
            $this->curEntry['href'] = $attribs['HREF'];
            $this->curEntry['title'] = htmlspecialchars_decode($attribs['TITLE'], ENT_QUOTES|ENT_XML1);
        } elseif ($name == 'PUBLISHED') {
            $this->inPublished = true;
            $this->curEntry['published'] = '';
        }

    }

    public function parseCdata($parser, $data) {
        if ($this->inPublished) {
            $this->curEntry['published'] .= $data;
        }
    }

    public function parseCloseElement($parser, $name) {
        /** @var $statement PDOStatement */
        static $statement = null;
        /** @var $timeStatement PDOStatement */
        static $timeStatement = null;
        if ($statement == null) {
            $prefix = $this->getOption('prefix');
            $statement = $this->database->prepare("select id, permalink from {$prefix}entries left join {$prefix}permalinks on entry_id = id where timestamp between :mintimestamp and :maxtimestamp and (title = :title or title = :broken_title) and (type = 'entry' or permalink is null)");
            $timeStatement = $this->database->prepare("select id, permalink from {$prefix}entries left join {$prefix}permalinks on entry_id = id where timestamp between :mintimestamp and :maxtimestamp and (type = 'entry' or permalink is null)");
        }
        if ($name == 'ENTRY') {
            if ($this->curEntry['type'] == 'post') {
                // print element:
                $statement->execute(array(':mintimestamp' => $this->curEntry['published']-3600, ':maxtimestamp' => $this->curEntry['published']+3600, ':title' => $this->curEntry['title'], ':broken_title' => $this->breakUtf8($this->curEntry['title'])));
                if ($statement->rowCount() == 0) {
                    $timeStatement->execute(array(':mintimestamp' => $this->curEntry['published']-300, ':maxtimestamp' => $this->curEntry['published']+300));
                    if ($timeStatement->rowCount() == 1) {
                        while ($permalink = $timeStatement->fetch(PDO::FETCH_ASSOC)) {
                            echo 'Redirect 301 /', $permalink['permalink'], ' ', $this->curEntry['href'], "\n";
                        }
                    } else {
                        $this->abort('No entry found for timestamp '.$this->curEntry['published'].' and title '.$this->curEntry['title'].', found '.$timeStatement->rowCount().' results without title.');
                    }
                    $timeStatement->closeCursor();
                } else {
                    while ($permalink = $statement->fetch(PDO::FETCH_ASSOC)) {
                        echo 'Redirect 301 /', $permalink['permalink'], ' ', $this->curEntry['href'], "\n";
                    }
                }
                $statement->closeCursor();
            }
            $this->curEnty = array();
        } elseif ($name == 'PUBLISHED') {
            $this->inPublished = false;
            $this->curEntry['published'] = strtotime($this->curEntry['published']);
        }
    }

    private function abort($message) {
        @ob_end_clean();
        $this->errors[] = $message;
        $this->printHtml();
        exit;
    }

    private function getOption($name) {
        static $opts = array(
            'user'     => 'root',
            'password' => '',
            'host'     => 'localhost',
            'port'     => '',
            'database' => '',
            'prefix'   => 'serendipity_',
            'offset'   => 0,
            'limit'    => 100,
            'fbheader' => 'Facebook Comments',
            'format'   => 'blogger'
        );
        if(isset($_POST[$name])) {
            return $_POST[$name];
        } elseif(isset($opts[$name])) {
            return $opts[$name];
        } else {
            return '';
        }
    }

    private function printXmlHeader() {
        echo "<?xml version='1.0' encoding='UTF-8'?>\n";
        echo '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:thr="http://purl.org/syndication/thread/1.0"><generator>Blogger</generator>'."\n";
    }

    private function printPost(stdClass $post, PDOStatement $categories, PDOStatement $tags) {
        echo '<entry>', "\n";
        echo '<category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>', "\n";
        echo '<published>', date('c', $post->timestamp),'</published>', "\n";
        echo '<updated>', date('c', $post->last_modified), '</updated>', "\n";
        echo '<id>post-', $post->id, '</id>', "\n";
        // Blogger allows at maximum 20 labels, use the first 20 ones
        $num_labels = 0;
        while (($category = $categories->fetch(PDO::FETCH_OBJ)) && $num_labels < 20) {
            echo '<category scheme="http://www.blogger.com/atom/ns#" term="', $this->escapeXml($category->category_name),'" />', "\n";
            ++$num_labels;
        }
        while (($tag = $tags->fetch(PDO::FETCH_OBJ)) && $num_labels < 20) {
            echo '<category scheme="http://www.blogger.com/atom/ns#" term="', $this->escapeXml($tag->tag),'" />', "\n";
            ++$num_labels;
        }
        echo '<content type="html">', $this->escapeXml($post->body);
        if ($post->extended) {
            echo $this->escapeXml('<!--more-->'.$post->extended);
        } elseif ($this->getOption('facebook')) {
            echo $this->escapeXml('<!--more-->');
        }
        if ($this->getOption('facebook')) {
            echo $this->escapeXml("\n\n<div class=\"fbcomments\"><h3>{$this->getOption('fbheader')}</h3>\n<fb:comments href=\"{$this->getOption('url')}{$post->permalink}\"></fb:comments></div>\n");
        }
        echo '</content>', "\n";
        echo '<title type="html">', $this->escapeXml($post->title), '</title>', "\n";
        if ($post->isdraft == 'true') {
            echo '<app:control xmlns:app="http://purl.org/atom/app#"><app:draft>yes</app:draft></app:control>';
        }
        if ($post->author) {
            echo '<author><name>', $this->escapeXml($post->author), '</name></author>';
        } else {
            echo '<author><name>Anonymous</name></author>';
        }
        echo '</entry>', "\n";
    }

    private function printComment($comment) {
        // Blogger doesn't like empty comments
        if (!($comment->body || $comment->type != 'NORMAL')) return;
        echo '<entry>';
        echo '<category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#comment"/>', "\n";
        echo '<published>', date('c', $comment->timestamp),'</published>', "\n";
        echo '<id>comment-', $comment->id, '</id>', "\n";
        echo '<title type="html">', $this->escapeXml($comment->title), '</title>', "\n";
        echo '<content type="html">';
        switch ($comment->type) {
            case 'TRACKBACK' :
                echo $this->escapeXml('<strong>Trackback:</strong> <a href="'.htmlspecialchars($comment->url).'">'.htmlspecialchars($comment->title).'</a><br />');
                break;
            case 'PINGBACK':
                echo $this->escapeXml('<strong>Pingback:</strong> <a href="'.htmlspecialchars($comment->url).">".htmlspecialchars($comment->title).'</a>');
                break;
        }
        echo $this->escapeXml($comment->body),'</content>', "\n";
        echo '<author><name>';
        if ($comment->author) {
            echo $this->escapeXml($comment->author);
        } else {
            echo 'Anonymous';
        }
        echo '</name>';
        if ($comment->url) {
            echo '<uri>',$this->escapeXml($comment->url),'</uri>';
        }
        echo '</author>', "\n";
        echo '<link rel="self" href="http://www.example.com/post/', $comment->entry_id ,'/comment/', $comment->id,'" type="application/atom+xml" />', "\n";
        if ($comment->parent_id) {
            echo '<link rel="related" href="http://www.example.com/post/', $comment->entry_id ,'/comment/', $comment->parent_id,'" type="application/atom+xml" />', "\n";
        }
        echo '<thr:in-reply-to ref="post-', $comment->entry_id, '" type="text/html" />', "\n";
        echo '</entry>', "\n";
    }

    private function printXmlFooter() {
        echo '</feed>';
    }

    private function breakUtf8($string) {
        return @iconv("CP1252", "UTF-8", $string);
    }
    private function fixUtf8($string) {
        // asume utf8 is broken unless there is some German umlaut in the string
        $umlauts = array('ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü');
        $broken = true;
        foreach ($umlauts as $test) {
            if (strpos($string, $test) !== false) {
                $broken = false;
                break;
            }
        }
        if ($broken) {
            $string = iconv("UTF-8", "CP1252//TRANSLIT", $string);
        }
        return $string;
    }

    private function escapeXml($string) {
        return htmlspecialchars($this->fixUtf8($string), ENT_QUOTES|ENT_XML1|ENT_SUBSTITUTE, 'UTF-8');
    }

    private function printInput($opt, $label, $type = 'text', $value = '') {
        ?>
    <div class="control-group">
        <?php if ($type == 'text' || $type == 'file') : ?>
        <label class="control-label"
               for="input<?php echo ucfirst($opt); ?>"><?php echo htmlspecialchars($label); ?></label>

        <div class="controls">
            <input type="<?php echo $type; ?>" name="<?php echo $opt; ?>" id="input<?php echo ucfirst($opt); ?>"
                   <?php if ($type == 'text'): ?>value="<?php echo htmlspecialchars($this->getOption($opt)); ?>"<?php endif;?>>
        </div>
        <?php elseif ($type == 'button') : ?>
    <div class="controls">
            <button type="submit" class="btn"><?php echo $label; ?></button>
        </div>
        <?php else: ?>
        <div class="controls">
            <label class="<?php echo $type; ?>">
                <input type="<?php echo $type; ?>" name="<?php echo $opt; ?>"<?php if ($value) echo ' value="',$value,'"'; if ($this->getOption($opt) == $value) echo ' checked="checked"'; ?> />
                <?php echo htmlspecialchars($label); ?>
            </label>
        </div>
        <?php endif; ?>
    </div>
    <?php
    }

    public function printHtml() {
        ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Serendipity to Blogger export</title>
        <!-- Bootstrap -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="http:///netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
              rel="stylesheet">
    </head>
    <body>
    <div class="container">
        <h1>Serendipity to Blogger export</h1>

        <?php
        // print errors
        foreach($this->errors as $error) {
            ?>
            <div class="alert alert-error">
                <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
            </div>
            <?php
        }
        ?>

        <p>Please enter the necessary information below!</p>

        <form class="form-horizontal" method="post" action="" enctype="multipart/form-data">
            <fieldset>
                <legend>Database</legend>
                <?php
                $this->printInput('user', 'Username');
                $this->printInput('password', 'Password');
                $this->printInput('database', 'Database name');
                $this->printInput('prefix', 'Database prefix');
                $this->printInput('host', 'Database server');
                $this->printInput('port', 'Database port');
                ?>
            </fieldset>
            <fieldset>
                <legend>Posts to export</legend>
                <?php
                $this->printInput('offset', 'First post');
                $this->printInput('limit', 'Number of posts');
                ?>
            </fieldset>
            <fieldset>
                <legend>Export options</legend>
                <?php
                $this->printInput('url', 'Base URL (including /)');
                $this->printInput('facebook', 'Include Facebook comments', 'checkbox', 'true');
                $this->printInput('fbheader', 'Facebook comments header');
                $this->printInput('export', 'Blogger export for redirects', 'file');
                $this->printInput('format', 'Blogger XML', 'radio', 'blogger');
                $this->printInput('format', '.htaccess (Redirects)', 'radio', 'htaccess');
                ?>
            </fieldset>
            <fieldset>
                <?php $this->printInput('submit', 'Export', 'button'); ?>
            </fieldset>
        </form>
    </div>
    </body>
    </html>
    <?php
    }
}

date_default_timezone_set('UTC');
new s9y2blogger();
