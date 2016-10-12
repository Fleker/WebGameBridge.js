package com.felkertech.n.myapplication;

/**
 * Created by N on 2/14/2015.
 */
public class WebAchievement {
    private int currentSteps;
    private String formattedTotalSteps;
    private int totalSteps;
    private int state;
    public WebAchievement(String id, String name, String description, int type, int totalSteps, String formattedTotalSteps, String revealedIconUrl,
                          String unlockedIconUrl, int state, long experiencePoints, int currentSteps) {
        this.currentSteps = currentSteps;
        this.totalSteps = totalSteps;
        this.formattedTotalSteps = formattedTotalSteps;
    }

    public int getCurrentSteps() {
        return currentSteps;
    }

    public int getTotalSteps() {
        return totalSteps;
    }

    public int getState() {
        return state;
    }

    public String getFormattedTotalSteps() {
        return formattedTotalSteps;
    }

    public void setFormattedTotalSteps(String formattedTotalSteps) {
        this.formattedTotalSteps = formattedTotalSteps;
    }

    public void setState(int state) {
        this.state = state;
    }

    /**
     * Increments an achievement's step counter
     * @param steps The number of steps you wish to increment
     * @return The new current step count
     */
    public int increment(int steps) {
        currentSteps += steps;
        checkLock();
        return currentSteps;
    }
    public void reveal() {
        if(getState() == ACHIEVEMENTS.HIDDEN)
            setState(ACHIEVEMENTS.REVEALED);
    }

    public void setCurrentSteps(int currentSteps) {
        if(getCurrentSteps() < currentSteps)
            this.currentSteps = currentSteps;
        checkLock();
    }
    public void checkLock() {
        if(getCurrentSteps() >= getTotalSteps())
            setState(ACHIEVEMENTS.UNLOCKED);
    }
}
