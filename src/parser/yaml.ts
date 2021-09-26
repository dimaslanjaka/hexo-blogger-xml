import YAML from "yaml";

class ParserYaml {
  fromObject(jsonObject: object) {
    const doc = new YAML.Document();
    doc.contents = jsonObject;
    console.log(doc.toString());
  }
}

export default ParserYaml;
