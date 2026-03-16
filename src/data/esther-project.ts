/**
 * Esther Bar Dizengoff as a static project - appears in Projects & Dashboard
 */

export const ESTHER_PROJECT_ID = "esther";
export const ESTHER_PROJECT_NAME = "אסתר בר דיזינגוף";
export const ESTHER_ORG_NAME = "À La Carte";

export interface StaticProject {
  id: string;
  name: string;
  organizationName: string;
  status: string;
  _count: { tasks: number; recipes: number; menus: number };
}

export const ESTHER_PROJECT: StaticProject = {
  id: ESTHER_PROJECT_ID,
  name: ESTHER_PROJECT_NAME,
  organizationName: ESTHER_ORG_NAME,
  status: "active",
  _count: {
    tasks: 0,
    recipes: 0,
    menus: 0,
  },
};
