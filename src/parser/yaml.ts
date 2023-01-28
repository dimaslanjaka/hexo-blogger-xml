import YAML from 'yaml';

class ParserYaml {
  static fromObject(jsonObject: Record<string, any>) {
    const doc = new YAML.Document<any>();
    doc.contents = jsonObject;
    //console.log(doc.toString());
    return doc.toString();
  }
}

export default ParserYaml;
