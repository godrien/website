import { moduleActionContext } from "..";
import { PlayerState, PlayerProfile, RaceStat, ModeStat, RankStat } from "./types";
import { Match } from "../typings";
import PercentageService from '@/services/PercentageService';
import { API_URL } from '@/main';

const mod = {
    namespaced: true,
    state: {
        playerProfile: {} as PlayerProfile,
        recentMatches: [] as Match[],
        loadingProfile: false,
        loadingRecentMatches: false,
    } as PlayerState,
    actions: {
        async loadProfile(context: any, battleTag: string) {
            const { commit } = moduleActionContext(context, mod);
            const url = `${API_URL}/userstats`;

            commit.SET_LOADING_PROFILE(true);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ account: battleTag })
            });

            const data = await response.json();

            const profile = {} as PlayerProfile;

            profile.account = data.account;
            profile.server = data.server;

            const raceStats: RaceStat[] = [];

            for (const key in data.data.stats) {
                if (Object.prototype.hasOwnProperty.call(data.data.stats, key)) {
                    const element = data.data.stats[key];

                    const percentage = ((element.wins * 100) / (element.wins + element.losses) || 0);

                    raceStats.push({
                        race: key,
                        wins: element.wins,
                        losses: element.losses,
                        total: element.wins + element.losses,
                        percentage: percentage > 0 ? Number(percentage.toFixed(1)) : 0,
                    });
                }
            }

            profile.stats = raceStats;

            const modeStats: ModeStat[] = [];
            modeStats.push({
                type: "Wins",
                solo: data.data.ladder.solo.wins,
                twoOnTwo: data.data.ladder.two.wins,
                threeOnThree: data.data.ladder.three.wins,
                fourOnFour: data.data.ladder.four.wins,
                ffa: data.data.ladder.ffa.wins
            });

            modeStats.push({
                type: "Losses",
                solo: data.data.ladder.solo.losses,
                twoOnTwo: data.data.ladder.two.losses,
                threeOnThree: data.data.ladder.three.losses,
                fourOnFour: data.data.ladder.four.losses,
                ffa: data.data.ladder.ffa.losses
            });
            const solo = PercentageService.getPercentage(data.data.ladder.solo.wins, (data.data.ladder.solo.wins + data.data.ladder.solo.losses))
            const twoOnTwo = PercentageService.getPercentage(data.data.ladder.two.wins, (data.data.ladder.two.wins + data.data.ladder.two.losses))
            const threeOnThree = PercentageService.getPercentage(data.data.ladder.three.wins, (data.data.ladder.three.wins + data.data.ladder.three.losses))
            const fourOnFour = PercentageService.getPercentage(data.data.ladder.four.wins, (data.data.ladder.four.wins + data.data.ladder.four.losses))
            const ffa = PercentageService.getPercentage(data.data.ladder.ffa.wins, (data.data.ladder.ffa.wins + data.data.ladder.ffa.losses))

            modeStats.push({
                type: "Percentage",
                solo: solo > 0 ? Number(solo.toFixed(1)) : 0,
                twoOnTwo: twoOnTwo > 0 ? Number(twoOnTwo.toFixed(1)) : 0,
                threeOnThree: threeOnThree > 0 ? Number(threeOnThree.toFixed(1)) : 0,
                fourOnFour: fourOnFour > 0 ? Number(fourOnFour.toFixed(1)) : 0,
                ffa: ffa > 0 ? Number(ffa.toFixed(1)) : 0,
            });

            profile.ladder = modeStats;

            const rankStats: RankStat[] = [];

            for (const key in data.data.ladder) {
                if (Object.prototype.hasOwnProperty.call(data.data.ladder, key)) {
                    const element = data.data.ladder[key];

                    rankStats.push({
                        title: key,
                        level: element.level,
                        xp: element.xp,
                        rank: element.rank
                    });
                }
            }

            profile.ranks = rankStats;

            commit.SET_PROFILE(profile);
            commit.SET_LOADING_PROFILE(false);
        },
        async loadRecentMatches(context: any, battleTag: string) {
            const { commit, rootGetters } = moduleActionContext(context, mod);
            
            commit.SET_LOADING_RECENT_MATCHES(true);
            const response = await rootGetters.matchService.retrievePlayerMatches(0, battleTag);
            commit.SET_RECENT_MATCHES(response.items);
            commit.SET_LOADING_RECENT_MATCHES(false);
        }
    },
    mutations: {
        SET_PROFILE(state: PlayerState, profile: PlayerProfile) {
            state.playerProfile = profile;
        },
        SET_RECENT_MATCHES(state: PlayerState, matches: Match[]) {
            state.recentMatches = matches;
        },
        SET_LOADING_PROFILE(state: PlayerState, loading: boolean) {
            state.loadingProfile = loading;
        },
        SET_LOADING_RECENT_MATCHES(state: PlayerState, loading: boolean) {
            state.loadingRecentMatches = loading;
        },
    }
} as const;

export default mod;