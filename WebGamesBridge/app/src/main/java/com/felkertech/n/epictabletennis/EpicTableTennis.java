package com.felkertech.n.epictabletennis;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import com.felkertech.n.myapplication.R;
import com.felkertech.n.myapplication.WebViewActivity;

public class EpicTableTennis extends WebViewActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        initialize("http://felkerdigitalmedia.com/pong/retro.php", new String[]{"Games", "Plus"});
        super.onCreate(savedInstanceState);
    }
}
