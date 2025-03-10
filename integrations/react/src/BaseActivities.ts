import { ActivityComponentType } from "./activity";

export type BaseActivities = {
  [activityName: string]: ActivityComponentType<any>;
};
