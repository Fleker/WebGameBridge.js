package com.felkertech.n.myapplication;

import com.google.android.gms.games.achievement.Achievement;

/**
 * Created by N on 2/14/2015.
 */
public abstract class ACHIEVEMENTS {
    public static int STANDARD = Achievement.TYPE_STANDARD;
    public static int INCREMENTAL = Achievement.TYPE_INCREMENTAL;
    public static int HIDDEN = Achievement.STATE_HIDDEN;
    public static int REVEALED = Achievement.STATE_REVEALED;
    public static int UNLOCKED = Achievement.STATE_UNLOCKED;

    public static int TYPE_TO_INT(String t) {
        if(t.equals("STANDARD"))
            return STANDARD;
        else
            return INCREMENTAL;
    }
    public static int STATE_TO_INT(String s) {
        if(s.equals("HIDDEN"))
            return HIDDEN;
        else if(s.equals("REVEALED"))
            return REVEALED;
        else
            return UNLOCKED;
    }
}
