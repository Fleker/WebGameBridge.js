package com.felkertech.n.epictabletennis;

import android.os.Bundle;

import com.felkertech.n.myapplication.WebViewActivity;

public class EpicTableTennis extends WebViewActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        initialize("http://felkerdigitalmedia.com/pong/retro.php", new String[]{"Games", "Plus"});
        super.onCreate(savedInstanceState);
    }
}
