<?php
/*
The MIT License (MIT)
Copyright (c) [2015] [sukualam]
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


// Path to Blogger Backup Blog Filename (.xml)
$filename = 'src/webmanajemen.com.xml';

// parse the heck out to mixed array and object...
$parse = simplexml_load_file($filename);
// because $parse still messy, we convert it to json
$encode = json_encode($parse);
// after convert to json, we decode that json to associative array
$dec = json_decode($encode, true);

// $term is the filter for 'post' data
$term = 'http://schemas.google.com/blogger/2008/kind#post';

// BELOW JUST EXAMPLE

/*
 * Example Info: This will show all posts in backup file
 * you can hack this more...
 */
var_dump($dec);

if ($dec) foreach ($dec['entry'] as $id => $content) {
	if ($content['category'][0]['@attributes']['term'] == $term) {
		$link = $content['link'][4]['href'];
		array_shift($content['category']);
		foreach ($content['category'] as $keys => $tag) {
			$tags[] = $content['category'][$keys]['@attributes']['term'];
		}
		echo '<h1>' . $content['title'] . '</h1>';
		echo '<h2>' . $id . '</h2>';
		echo '<span>' . implode(',', $tags) . '</span>';
		echo $content['content'];
		echo '<hr>';
		unset($tags);
	}
}
