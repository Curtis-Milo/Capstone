package com.lazybots.alfredui;

import android.graphics.Bitmap;

import java.io.Serializable;
import java.util.HashMap;

/**
 * Created by Keyur on 2017-10-13.
 */

public class Drink implements Serializable {
    static HashMap<String,Integer> DRINK_SIZES = new HashMap<String, Integer>();
    static {
        DRINK_SIZES.put("SMALL",0);
        DRINK_SIZES.put("MEDIUM",1);
        DRINK_SIZES.put("LARGE",2);
    }

    private String name;
    private int[] calories = new int[3];
    private double[] prices = new double[3];
    private int image;

    /**
     *
     * @param name: the name of the drink
     * @param calories: an int array of the calories depending on dirnk size.
     *                  format as such calories = {SMALL,MEDIUM,LARGE}
     */
    public Drink(String name, int[] calories, int image, double[] prices) {
        setName(name);
        setCalories(calories);
        setImage(image);
        setPrices(prices);
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void setCalories(int[] calories) {
        this.calories = calories;
    }

    public int[] getCalories() {
        return this.calories;
    }

    public void setImage(int image) {
        this.image = image;
    }

    public int getImage() {
        return this.image;
    }

    public void setCaloriesForSize(String size, int calories) {
        this.calories[DRINK_SIZES.get(size)] = calories;
    }

    public int getCaloriesForSize(String size){
        return this.calories[DRINK_SIZES.get(size)];
    }

    public void setPrices(double[] prices) {
        this.prices = prices;
    }

    public double[] getPrices() {
        return this.prices;
    }

    public void setPriceForSize(String size, double price) {
        this.prices[DRINK_SIZES.get(size)] = price;
    }

    public double getPriceForSize(String size) {
        return this.prices[DRINK_SIZES.get(size)];
    }
}
