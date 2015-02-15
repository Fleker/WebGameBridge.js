package com.felkertech.n.myapplication;

import com.google.android.gms.games.Games;
import com.google.android.gms.games.leaderboard.LeaderboardVariant;

/**
 * Created by N on 1/19/2015.
 */
public abstract class LEADERBOARDS {
    public static String ALL = "ALL";
    public static int ALL_TIME = LeaderboardVariant.TIME_SPAN_ALL_TIME;
    public static int DAILY = LeaderboardVariant.TIME_SPAN_DAILY;
    public static int WEEKLY = LeaderboardVariant.TIME_SPAN_WEEKLY;
    public static int PUBLIC = LeaderboardVariant.COLLECTION_PUBLIC;
    public static int SOCIAL = LeaderboardVariant.COLLECTION_SOCIAL;
    public static int LARGER_IS_BETTER = 1;
    public static int SMALLER_IS_BETTER = 2;

    public static int TIME_TO_INT(String t) {
        if(t.equals("ALL_TIME"))
            return ALL_TIME;
        else if(t.equals("DAILY"))
            return DAILY;
        else if(t.equals("WEEKLY"))
            return WEEKLY;
        return ALL_TIME;
    }
    public static int RANK_TO_INT(String t) {
        if(t.equals("PUBLIC"))
            return PUBLIC;
        else
            return SOCIAL;
    }
}
