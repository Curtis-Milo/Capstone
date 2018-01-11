package com.lazybots.alfredui;

import java.io.Serializable;

/**
 * Created by Keyur on 2017-10-13.
 */

public class Drink implements Serializable {

    private String name;
    private int calories;
    private double price;
    private int image;
    private int amount;

    /**
     *
     * @param name: the name of the drink
     * @param calories: an int array of the calories depending on drink size.
     *                  format as such calories = {SMALL,MEDIUM,LARGE}
     */
    public Drink(String name, int calories, int image, double price) {
        setName(name);
        setCalories(calories);
        setImage(image);
        setPrice(price);
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getCalories() {
        return this.calories;
    }

    public void setImage(int image) {
        this.image = image;
    }

    public int getImage() {
        return this.image;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getPrice() {
        return this.price;
    }

    public int getAmount() { return this.amount; }

    public void setAmount(int amount) { this.amount=amount;}

    public double getPriceForAmount() {
       return getAmount() * getPrice() ;
    }
}
