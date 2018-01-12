package com.lazybots.alfredui;

import android.os.Bundle;

import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.NumberPicker;

public class Activity_Login extends AppCompatActivity {
    NumberPicker np;
    int tableNum;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        np = (NumberPicker)findViewById(R.id.tableNumberPicker);

        np.setMinValue(1);
        np.setMaxValue(9);

        np.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                tableNum = newVal;
            }
        });

    }

    public void onClickButtonApplySettings(View v) {

    }

}
