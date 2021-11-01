export default function (str: string) {
  return str.replace(/ +(?= )/g, "");
}
