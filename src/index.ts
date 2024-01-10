import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
export default () => {
  return {
    name: "astro-screen-recorder",
    hooks: {
      "astro:config:setup": ({
                               addDevToolbarApp
                             }: {addDevToolbarApp: (file: string) => void}) => {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
        addDevToolbarApp(`${__dirname}/devToolbar/ScreenRecorder.js`);
      },
    },
  };
};
