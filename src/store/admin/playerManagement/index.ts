import { moduleActionContext } from "../..";
import { RootState } from "../../typings";
import { ActionContext } from "vuex";
import {
  AdminPlayerManagementState,
  ChangePortraitsCommand,
  PortraitDefinition,
  PortraitDefinitionDTO,
  PortraitDefinitionGroup,
} from "../types";
import { useOauthStore } from "@/store/oauth/store";
import PersonalSettingsService from "@/services/PersonalSettingsService";
import AdminService from "@/services/AdminService";

const mod = {
  namespaced: true,
  state: {
    allSpecialPortraits: [] as PortraitDefinition[],
    searchedPlayerSpecialPortraits: [] as number[],
  } as AdminPlayerManagementState,

  actions: {
    async loadAllSpecialPortraits(context: ActionContext<AdminPlayerManagementState, RootState>) {
      const { commit } = moduleActionContext(context, mod);

      const oauthStore = useOauthStore();
      const availablePortraits = await AdminService.getAllSpecialPortraits(oauthStore.token);
      commit.SET_SPECIAL_PORTRAITS(availablePortraits);
    },

    async loadSpecialPortraitsForPlayer(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      btag: string
    ): Promise<void> {
      const { commit } = moduleActionContext(context, mod);
      const playerSettings = await PersonalSettingsService.retrievePersonalSetting(btag);
      if (playerSettings.specialPictures != null) {
        commit.SET_SEARCHED_PLAYER_SPECIAL_PORTRAITS(playerSettings.specialPictures.map((x) => x.pictureId));
      } else {
        commit.SET_SEARCHED_PLAYER_SPECIAL_PORTRAITS([] as number[]);
      }
      commit.SET_MANAGED_PLAYER_BATTLETAG(btag);
    },

    async addPortraits(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      portraitCommand: ChangePortraitsCommand
    ): Promise<void> {
      const oauthStore = useOauthStore();
      await AdminService.putPortraits(oauthStore.token, portraitCommand);
    },

    async removePortraits(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      portraitCommand: ChangePortraitsCommand
    ): Promise<void> {
      const oauthStore = useOauthStore();
      await AdminService.deletePortraits(oauthStore.token, portraitCommand);
    },

    clearManagedPlayer(context: ActionContext<AdminPlayerManagementState, RootState>): void {
      const { commit } = moduleActionContext(context, mod);
      commit.SET_MANAGED_PLAYER_BATTLETAG("");
    },

    async loadPortraitDefinitionGroups(context: ActionContext<AdminPlayerManagementState, RootState>): Promise<void> {
      const {  commit } = moduleActionContext(context, mod);

      const portDefGroups = await AdminService.getAllPortraitDefinitionGroups();
      commit.SET_PORTRAIT_DEFINITION_GROUPS(portDefGroups);
    },

    async addNewPortraitDefinition(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      definition: PortraitDefinitionDTO
    ): Promise<void> {
      const oauthStore = useOauthStore();
      await AdminService.postPortraitDefinitions(oauthStore.token, definition);
    },

    async removePortraitDefinition(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      definition: PortraitDefinitionDTO
    ): Promise<void> {
      const oauthStore = useOauthStore();
      await AdminService.deletePortraitDefinitions(oauthStore.token, definition);
    },

    async updatePortraitDefinition(
      context: ActionContext<AdminPlayerManagementState, RootState>,
      definition: PortraitDefinitionDTO
    ): Promise<void> {
      const oauthStore = useOauthStore();
      await AdminService.putPortraitDefinitions(oauthStore.token, definition);
    },
  },

  mutations: {
    SET_MANAGED_PLAYER_BATTLETAG(state: AdminPlayerManagementState, battleTag: string) {
      state.managedBattleTag = battleTag;
    },
    SET_SPECIAL_PORTRAITS(state: AdminPlayerManagementState, specialPortraits: PortraitDefinition[]) {
      state.allSpecialPortraits = specialPortraits;
    },
    SET_SEARCHED_PLAYER_SPECIAL_PORTRAITS(state: AdminPlayerManagementState, specialPortraits: number[]) {
      state.searchedPlayerSpecialPortraits = specialPortraits;
    },
    SET_PORTRAIT_DEFINITION_GROUPS(state: AdminPlayerManagementState, portDefGroups: PortraitDefinitionGroup[]) {
      state.portraitDefinitionGroups = portDefGroups;
    },
  },
} as const;

export default mod;
