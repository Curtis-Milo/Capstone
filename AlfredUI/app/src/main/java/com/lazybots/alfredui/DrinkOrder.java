package com.lazybots.alfredui;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * Created by Keyur on 2017-10-15.
 */

public class DrinkOrder implements Serializable {

    public item[] order;

    public DrinkOrder(ArrayList<String[]> x) {
        order = new item[x.size()];
        int i=0;
        for (String[] y:x) {
            order[i] = new item();
            order[i].type = y[0];
            order[i].quantity = Integer.parseInt(y[1]);
            i++;
        }
    }

    private class item {
        String type;
        int quantity;
    }
}
