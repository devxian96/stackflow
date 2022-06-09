import { historySyncPlugin } from "@stackflow/plugin-history-sync";
import { renderPlugin } from "@stackflow/plugin-render";
import { stackflow } from "@stackflow/react";

import Article from "./components/Article";
import Home from "./components/Home";

const activities = {
  Home,
  Article,
};

export const { Stack, useFlow } = stackflow({
  activities,
  transitionDuration: 350,
  plugins: [
    renderPlugin(),
    historySyncPlugin<typeof activities>({
      routes: {
        Home: "/",
        Article: "/articles/:articleId",
      },
      fallbackActivityName: "Home",
    }),
  ],
});
