import { useActivity, useStack, useStackActions } from "@stackflow/react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import React, { useEffect, useMemo } from "react";
import { useSwipeBack } from "utils/useSwipeBack";

import AppBar from "./AppBar";
import * as css from "./AppScreen.css";
import {
  findBefore,
  useTopActiveActivity,
  useTopVisibleActivity,
  useVariant,
  useVisibleActivities,
} from "./utils";

const last = <T extends unknown>(arr: T[]) => arr[arr.length - 1];

type PropOf<T> = T extends React.ComponentType<infer U> ? U : unknown;

const appScreenPaperRefMap = new Map<string, React.RefObject<any>>();

interface AppScreenProps {
  theme: "android" | "cupertino";
  appBar?: Omit<PropOf<typeof AppBar>, "theme">;
  children: React.ReactNode;
}
const AppScreen: React.FC<AppScreenProps> = ({ theme, appBar, children }) => {
  const stack = useStack();
  const stackActions = useStackActions();
  const currentActivity = useActivity();

  const visibleActivities = useVisibleActivities();

  const topVisibleActivity = useTopVisibleActivity();
  const topActiveActivity = useTopActiveActivity();

  const isTopActive = useMemo(
    () => topActiveActivity?.id === currentActivity.id,
    [topActiveActivity, currentActivity],
  );
  const isTopVisible = useMemo(
    () => topVisibleActivity?.id === currentActivity.id,
    [topVisibleActivity, currentActivity],
  );
  const isRoot = visibleActivities[0]?.id === currentActivity.id;

  const isBeforeTopVisibleActivity = useMemo(() => {
    const beforeTopVisibleActivity = findBefore(
      visibleActivities,
      (activity) => activity.id === topVisibleActivity.id,
    );
    return beforeTopVisibleActivity?.id === currentActivity.id;
  }, [visibleActivities, topVisibleActivity]);

  const { ref: appScreenRef, className: appScreen } = useVariant({
    variant: currentActivity.transitionState,
    base: css.appScreen({
      theme,
      show: isTopVisible || isBeforeTopVisibleActivity,
    }),
    variants: {
      "enter-active": css.enterActive,
      "enter-done": css.enterDone,
      "exit-active": css.exitActive,
      "exit-done": css.exitDone,
    },
    lazy: {
      "enter-active": true,
    },
  });

  const beforeActivity = useMemo(
    () =>
      findBefore(
        visibleActivities,
        (activity) => activity.id === currentActivity.id,
      ),
    [visibleActivities],
  );

  const { dimRef, paperRef, edgeRef } = useSwipeBack({
    transitionDuration: stack.transitionDuration,
    getBeforePaper() {
      if (!beforeActivity) {
        return null;
      }
      return appScreenPaperRefMap.get(beforeActivity.id)?.current;
    },
    onBack() {
      stackActions.pop();
    },
  });

  useEffect(() => {
    appScreenPaperRefMap.set(currentActivity.id, paperRef);
    return () => {
      appScreenPaperRefMap.delete(currentActivity.id);
    };
  }, [currentActivity, paperRef]);

  const zIndex = useMemo(
    () =>
      visibleActivities.findIndex(
        (activity) => activity.id === currentActivity.id,
      ),
    [visibleActivities, currentActivity],
  );

  const hasAppBar = !!appBar;

  const zIndexBase = zIndex * 4;
  const zIndexDim = zIndexBase;
  const zIndexPaper = zIndexBase + (hasAppBar ? 1 : 3);
  const zIndexAppBar = zIndexBase + 6;

  return (
    <div
      ref={appScreenRef}
      className={appScreen}
      style={assignInlineVars({
        [css.vars.zIndexes.dim]: `${zIndexDim}`,
        [css.vars.zIndexes.paper]: `${zIndexPaper}`,
        [css.vars.zIndexes.appBar]: `${zIndexAppBar}`,
        [css.vars.transitionDuration]: `${stack.transitionDuration}ms`,
      })}
    >
      <div ref={dimRef} className={css.dim} />
      <div
        key={currentActivity.id}
        ref={paperRef}
        className={css.paper({
          isTopActive,
          hasAppBar,
        })}
      >
        {children}
        {!isRoot && theme === "cupertino" && (
          <div ref={edgeRef} className={css.edge({ hasAppBar })} />
        )}
      </div>
      {appBar && <AppBar {...appBar} theme={theme} />}
    </div>
  );
};

export default AppScreen;
