package com.felkertech.n.myapplication;

import com.google.android.gms.games.leaderboard.Leaderboard;

/**
 * Created by N on 1/19/2015.
 */
public class WebLeaderboard {
    private String iconUrl;
    private String id;
    private boolean isIconUrlDefault;
    private String name;
    private int order;

    public WebLeaderboard(String iu, String id, boolean iiud, String n, int o) {
        iconUrl = iu;
        this.id = id;
        isIconUrlDefault = iiud;
        name = n;
        if(o == Leaderboard.SCORE_ORDER_LARGER_IS_BETTER)
            order = LEADERBOARDS.LARGER_IS_BETTER;
        else
            order = LEADERBOARDS.SMALLER_IS_BETTER;
    }
    public String getIconUrl() {
        return iconUrl;
    }

    public String getId() {
        return id;
    }

    public boolean isIconUrlDefault() {
        return isIconUrlDefault;
    }

    public String getName() {
        return name;
    }

    public int getOrder() {
        return order;
    }
}
