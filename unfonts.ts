import Unfonts from "unplugin-fonts/vite";

export const unfontsPlugin = Unfonts({
  fontsource: {
    families: [
      {
        name: "inter",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ["normal"],
        subset: 'latin'
      },
      {
        name: "poppins",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ["normal"],
        subset: 'latin'
      },
      {
        name: "quicksand",
        weights: [300, 400, 500, 600, 700],
        styles: ["normal"],
        subset: 'latin'
      }
    ]
  }
});
