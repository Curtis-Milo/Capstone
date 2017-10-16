package com.lazybots.alfredui;

import java.io.Serializable;
import java.util.HashMap;

/**
 * Created by Keyur on 2017-10-15.
 */

public class DrinkItem implements Serializable{
    static HashMap<String,Integer> DRINK_SIZES = new HashMap<String, Integer>();
    static {
        DRINK_SIZES.put("SMALL",0);
        DRINK_SIZES.put("MEDIUM",1);
        DRINK_SIZES.put("LARGE",2);
    }

    int [] order_amounts = new int[3];

    public void DrinkItem(){}
    public void DrinkItem(int[] order_amts) {
        setOrderAmts(order_amts);
    }

    public int[] getOrderAmounts(){
        return this.order_amounts;
    }

    public int getOrderAmountForSize(String size){
        return this.order_amounts[DRINK_SIZES.get(size)];
    }

    public void setOrderAmts(int[] orderAmts) {
        setOrderAmt("SMALL",orderAmts[DRINK_SIZES.get("SMALL")]);
        setOrderAmt("MEDIUM",orderAmts[DRINK_SIZES.get("MEDIUM")]);
        setOrderAmt("LARGE",orderAmts[DRINK_SIZES.get("LARGE")]);
    }

   public void setOrderAmt(String size, int amt) {
        order_amounts[DRINK_SIZES.get(size)] = amt;
    }
}
