package com.lazybots.alfredui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.NumberPicker;
import android.widget.Toast;

import java.io.UnsupportedEncodingException;

/**
 * Created by Keyur on 2018-01-14.
 */

public class Activity_Settings extends AppCompatActivity implements AsyncResponse {
    NetworkCalls server = null;
    NumberPicker tableNumPicker = null;
    NumberPicker.OnValueChangeListener tableNumPickerListener = null;
    int tableNum;
    SharedPreferences appData;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.admin_settings);

        server = new NetworkCalls();
        server.api_key = "table_token";
        server.delegate = this;

        tableNumPicker = (NumberPicker) findViewById(R.id.tableNumberPicker);
        tableNumPicker.setMinValue(1);
        tableNumPicker.setMaxValue(9);
        tableNum = tableNumPicker.getValue();
        //setTableNumPickerListener();
        //tableNumPicker.setOnValueChangedListener(tableNumPickerListener);

        appData = getSharedPreferences("prefs", MODE_PRIVATE);
        tableNum = appData.getInt("tableNum", 1);
        NumberPicker np = (NumberPicker) findViewById(R.id.tableNumberPicker);
        np.setValue(tableNum);

    }

    private void setTableNumPickerListener() {
        tableNumPickerListener = new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {

            }
        };
    }

    /**
     * @param v
     * @throws UnsupportedEncodingException
     */
    public void onClickButtonApply(View v) throws UnsupportedEncodingException {
        server.execute(tableNumPicker.getValue());
    }

    @Override
    public void processFinish(int responseCode, Object x) {
        if (responseCode == 200) {
            tableNum = tableNumPicker.getValue();
            SharedPreferences.Editor mEditor = appData.edit();
            mEditor.putInt("tableNum", tableNum);
            mEditor.apply();
            Intent i = new Intent(Activity_Settings.this, Activity_DrinksList.class);
            i.putExtra("tableToken", (String) x);
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(i);
        } else {
            Toast.makeText(Activity_Settings.this, "Table Change Unsuccessful", Toast.LENGTH_LONG).show();
        }
    }
}
