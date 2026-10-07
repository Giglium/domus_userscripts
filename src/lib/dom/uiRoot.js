import "../css/style.scss";

const ROOT_ID = "domus-userscript-ui";

export function getUiRoot() {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "domus-ui";
    document.body.appendChild(root);
  }
  return root;
}
