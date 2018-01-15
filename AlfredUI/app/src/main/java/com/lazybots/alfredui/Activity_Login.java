package com.lazybots.alfredui;

import android.os.AsyncTask;
import android.os.Bundle;

import android.support.v7.app.AppCompatActivity;
import android.util.Base64;
import android.view.View;
import android.widget.NumberPicker;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

public class Activity_Login extends AppCompatActivity {
    NumberPicker np;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        /*
        np = (NumberPicker)findViewById(R.id.tableNumberPicker);

        np.setMinValue(1);
        np.setMaxValue(9);

        np.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                tableNum = newVal;
            }
        });
        */

    }

    public void onClickButtonLogin(View v) {
    }
}
