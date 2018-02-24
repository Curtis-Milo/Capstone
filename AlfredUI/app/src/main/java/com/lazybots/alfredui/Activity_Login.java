package com.lazybots.alfredui;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Base64;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import java.io.UnsupportedEncodingException;

public class Activity_Login extends AppCompatActivity implements AsyncResponse {
    NetworkCalls server = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        server = new NetworkCalls();
        server.delegate = this;
        server.api_key = "login";
    }

    public void onClickButtonLogin(View v) throws UnsupportedEncodingException {
        String username = ((TextView) findViewById(R.id.username)).getText().toString();
        String password = ((TextView) findViewById(R.id.password)).getText().toString();
        String auth = Base64.encodeToString((username + ":" + password).getBytes("UTF-8"), 0);

        server = new NetworkCalls();
        server.delegate = this;
        server.api_key = "login";
        server.execute(auth);

    }

    @Override
    public void processFinish(int responseCode, Object x) {
        if (responseCode == 200) {
            Intent i = new Intent(Activity_Login.this, Activity_Settings.class);
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(i);
        } else if (responseCode == 1337) {
            Toast.makeText(Activity_Login.this, "Could not connect to server", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(Activity_Login.this, "Invalid credentials", Toast.LENGTH_LONG).show();
        }
    }
}
