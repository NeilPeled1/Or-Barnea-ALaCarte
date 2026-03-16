/**
 * Sheffield Bar as a static project - appears in Projects & Dashboard
 */

export const SHEFFIELD_PROJECT_ID = "sheffield";
export const SHEFFIELD_PROJECT_NAME = "Sheffield Bar";
export const SHEFFIELD_ORG_NAME = "À La Carte";

export interface StaticProject {
  id: string;
  name: string;
  organizationName: string;
  status: string;
  _count: { tasks: number; recipes: number; menus: number };
}

export const SHEFFIELD_PROJECT: StaticProject = {
  id: SHEFFIELD_PROJECT_ID,
  name: SHEFFIELD_PROJECT_NAME,
  organizationName: SHEFFIELD_ORG_NAME,
  status: "active",
  _count: {
    tasks: 0,
    recipes: 0, // computed from parsed data
    menus: 0,
  },
};
