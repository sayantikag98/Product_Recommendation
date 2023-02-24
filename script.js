import {productDatabase} from "./data.js";
const userInput = document.getElementById("user-form");
let userProduct = "", userRating = 0, userProductCategory = "", recommendedProduct = "", condition = "";

/**
 * sorts the array based on the custom order of decreasing rating and then increasing or decreasing order of prices based on isPriceIncreasing parameter.
 * @param {*} isPriceIncreasing - if true prices are sorted in ascending order otherwise in decreasing order.
 * @param {*} productsFiltered - array on which sort will be performed in place
 *  
 */
const sortArray = (isPriceIncreasing, productsFiltered) => {
    productsFiltered.sort((firstItem, secondItem) => {
        if(secondItem.rating > firstItem.rating) return 1;
        else if(secondItem.rating === firstItem.rating){
            if(isPriceIncreasing){
                if(firstItem.price >= secondItem.price) return 1;
                else return -1;
            }else{
                if(secondItem.price >= firstItem.price) return 1;
                else return -1;
            }  
        }
        else return -1;
    });
};

/**
 * Gives the recommended product after the user has submitted the form
 * @param {*} event 
 */

const onFormSubmit = (event) => {
    event.preventDefault();
    // getting form entries
    const formValue = new FormData(event.target);
    const formEntries = Object.fromEntries(formValue);
    userProduct = formEntries.product;
    userRating = parseFloat(formEntries.rating);
    userProductCategory = productDatabase.filter(item => item.name === userProduct)[0].category;
    if(userRating>4.5 || (userRating>= 4 && userRating<=4.5 && condition!=="second") || userRating<4){
        recommendedProduct = "No Product Found";
    }

    if(userRating>4.5){
        if(condition !== "first") condition = "first";
        // filtering out all the products which have rating above 4.3 and not the product given by the user
        const productsFiltered = productDatabase.filter(item => item.rating>4.3 && item.name !== userProduct);
        recommendForHigherRating(productsFiltered);
    }else if(userRating>=4 && userRating<=4.5){
        // condition used to prevent repeatedly calling the recommendation criteria
        if(condition !== "second"){
            condition = "second";
            //filtering out products which have rating above 4.5
            const productsFiltered = productDatabase.filter(item => item.rating>4.5);
            recommendForHigherRating(productsFiltered);
        }   
    }else{
        if(condition !== "third") condition = "third";
        // filtering out products which have category different than the user given product category
        const productsFiltered = productDatabase.filter(item => item.category !== userProductCategory);
        // sorting to get the highest rated product with lowest price in case of a match
        sortArray(true, productsFiltered);
        recommendedProduct = productsFiltered[0].name;
    }
    document.querySelector(".recommended-product").textContent = recommendedProduct;
}

/**
 * Helper function giving the recommended product for user rating input of greater than or equal to 4.
 * If 2 or more products have the same rating, then recommend a product from the same category. 
 * If products are from different category, then recommend the product with highest price.
 * @param {*} productsFiltered - Filtered array based on the user rating input
 */

const recommendForHigherRating = (productsFiltered) => {
    sortArray(false, productsFiltered);
    let firstRating = productsFiltered[0].rating, subArr = [];
    const newFilteredArray = []; 
    // to get all the products having two or more same ratings
    productsFiltered.forEach(item => {
        if(item.rating === firstRating){
            subArr.push(item);
        }
        else{
            if(subArr.length>=2)
                newFilteredArray.push(subArr);
            subArr = [item];
            firstRating = item.rating;
        }
    });
    if(subArr.length>=2)
        newFilteredArray.push(subArr);

        // getting the products having the same category as the product given by the user 
    let tempName = "";
    for(let i = 0; i<newFilteredArray.length; i++){
        let count = 0;
        for(let j = 0; j<newFilteredArray[i].length; j++){
            if(newFilteredArray[i][j].category === userProductCategory){
                count++;
                if(tempName === ""){
                    tempName = newFilteredArray[i][j].name;
                }
            }
        }
        if(count>=2){
            recommendedProduct = tempName;
            break;
        } 
    }

    // in case of a no match of the same catgory using highest price as the criteria

    if(recommendedProduct === "No Product Found"){
        let maxPrice = -1;
        newFilteredArray.forEach(item => {
            if(maxPrice<item[0].price){
                maxPrice = item[0].price;
                recommendedProduct = item[0].name;
            }
        });
    }
};

userInput.addEventListener("submit", onFormSubmit);






