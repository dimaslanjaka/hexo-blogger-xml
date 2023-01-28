import YAML from 'yaml';

class ParserYaml {
  static fromObject(jsonObject: object) {
    const doc = new YAML.Document();
    doc.contents = jsonObject;
    //console.log(doc.toString());
    return doc.toString();
  }
}

export default ParserYaml;
