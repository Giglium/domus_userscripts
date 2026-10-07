const { expect } = require("@playwright/test");

async function expectDomusButtonStyled(button) {
  await expect(button).toHaveCSS("display", "flex");
  await expect(button).not.toHaveCSS("padding", "1px 6px");
  await expect(button).not.toHaveCSS("background-color", "rgb(239, 239, 239)");
}

module.exports = { expectDomusButtonStyled };
