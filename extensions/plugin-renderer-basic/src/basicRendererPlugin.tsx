import { StackflowReactPlugin } from "@stackflow/react";
import React from "react";

export function basicRendererPlugin(): StackflowReactPlugin {
  return () => ({
    key: "render",
    render({ stack }) {
      return (
        <>
          {stack
            .render()
            .activities.filter(
              (activity) => activity.transitionState !== "exit-done",
            )
            .map((activity) => (
              <React.Fragment key={activity.key}>
                {activity.render()}
              </React.Fragment>
            ))}
        </>
      );
    },
  });
}
