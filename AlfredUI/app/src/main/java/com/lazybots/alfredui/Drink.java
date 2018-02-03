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

    /**
     * @return
     */
    public String getName() {
        return this.name;
    }

    /**
     *
     * @param name
     */
    private void setName(String name) {
        this.name = name;
    }

    /**
     *
     * @return
     */
    public int getCalories() {
        return this.calories;
    }

    /**
     *
     * @param calories
     */
    private void setCalories(int calories) {
        this.calories = calories;
    }

    /**
     *
     * @return
     */
    public int getImage() {
        return this.image;
    }

    /**
     *
     * @param image
     */
    private void setImage(int image) {
        this.image = image;
    }

    /**
     *
     * @return
     */
    public double getPrice() {
        return this.price;
    }

    /**
     *
     * @param price
     */
    private void setPrice(double price) {
        this.price = Math.round(price * 100.0) / 100.0;
    }

    /**
     * @return
     */
    public int getAmount() { return this.amount; }

    /**
     *
     * @param amount
     */
    public void setAmount(int amount) { this.amount=amount;}

    /**
     *
     * @return
     */
    public double getPriceForAmount() {
       return Math.round((getAmount() * getPrice()) * 100.0) / 100.0;
    }
}
