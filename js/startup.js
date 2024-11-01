var hostname = "https://wooshark.website";





function getImages(imagesBlock) {
    return imagesBlock;

}

function getVariations(skuModule, data) {
    var globalvariation = {
        variations: [],
        NameValueList: []
    }

    if (skuModule.skuPriceList && skuModule.skuPriceList.length) {
        skuModule.skuPriceList.forEach(function(element, index) {
            // _.each(skuModule.skuPriceList, function(element, index) {
            var salePrice = element.skuVal.actSkuMultiCurrencyCalPrice || element.skuVal.actSkuCalPrice;
            var regularPrice = element.skuVal.skuMultiCurrencyCalPrice || element.skuVal.skuCalPrice;
            if (element.skuPropIds && index < 100) {
                var attributesIds = element.skuPropIds.split(",");
                globalvariation.variations.push({
                    identifier: element.skuPropIds,
                    SKU: element.skuId,
                    availQuantity: element.skuVal.availQuantity,
                    salePrice: salePrice,
                    regularPrice: regularPrice,
                    attributesVariations: getAttributesVariations(element.skuPropIds, skuModule.productSKUPropertyList)
                });
            }
        });
    }

    if (skuModule.skuPriceList && skuModule.skuPriceList[0]) {
        globalvariation.NameValueList = buildNameListValues(skuModule.productSKUPropertyList);
    }

    return globalvariation;
}


function buildNameListValues(productSKUPropertyList) {
    var attribuesNamesAndValues = [];
    var attributes = jQuery('#j-product-info-sku').find('dt');
    productSKUPropertyList.forEach(function(item, index) {
        // _.each(productSKUPropertyList, function(item, index) {
        var attributeValues = getAttrValues(item);
        if (attributeValues && attributeValues.length) {
            attribuesNamesAndValues.push({
                name: item.skuPropertyName,
                value: attributeValues,
                variation: true,
                visible: true
            });
        }
    });
    return attribuesNamesAndValues;

}


function getAttrValues(item) {
    var values = [];
    item.skuPropertyValues.forEach(function(item) {
        // _.each(item.skuPropertyValues, function(item) {

        values.push(item.propertyValueDisplayName);

    });
    console.log('values', values);
    return values;
}




function getAttributesVariations(skuPropIds, productSKUPropertyList) {
    var attributesVariations = [];
    var attributesIds = skuPropIds.split(",");
    for (var i = 0; i < attributesIds.length; i++) {
        productSKUPropertyList.forEach(function(item) {
            // _.each(productSKUPropertyList, function(item) {
            item.skuPropertyValues.forEach(function(element) {
                // _.each(item.skuPropertyValues, function(element) {
                if (attributesIds[i] == element.propertyValueId) {
                    attributesVariations.push({
                        name: item.skuPropertyName,
                        value: element.propertyValueDisplayName,
                        image: element.skuPropertyImagePath
                    });
                }
            });

        });
    }
    return attributesVariations;
}



function getItemSpecificfromTable(globalvariation, itemSpec) {
    var trs = itemSpec;
    var attributesFromVariations = globalvariation.NameValueList.map(function(item) {
        return item.name;
    });

    if (trs && trs.length) {
        trs.forEach(function(item, index) {
            // _.each(trs, function(item, index) {
            if (index) {
                if (attributesFromVariations.indexOf(item.attrName) == -1) {
                    globalvariation.NameValueList.push({
                        name: item.attrName || '-',
                        visible: true,
                        variation: false,
                        value: [item.attrValue]
                    })
                }
            }
        });
    }
    return globalvariation;
}





function createAliexpressProduct(transitObject, isDirectimport) {
    waitingListProducts = [];
    var skuAttributes = '';
    var descriptionUrl;
    var attribObjArray;



    var originalPrice, totalAvailQuantity, salePrice;
    totalAvailQuantity = transitObject.quantity;
    originalPrice = transitObject.price;
    salePrice = transitObject.price;



    var aliExpressProduct = {
        title: transitObject.title,
        currentPrice: salePrice,
        originalPrice: originalPrice,
        description: transitObject.description,
        images: transitObject.images,
        totalAvailQuantity: totalAvailQuantity || 1,
        variations: [],
        productUrl: transitObject.productUrl,
        reviews: [],
        productCategoies: [],
        shortDescription: '',
        importSalePrice: true,
        inlcudeSkuAttribute: false,
        simpleSku: transitObject.productId.toString(),
        featured: true



    };

    jQuery('.waitingListClass').css({
        display: 'block'
    });

    console.log('aliExpressProduct', aliExpressProduct);

    waitingListProducts.push(aliExpressProduct);
    importProducts();

}

globalBulkCount = 0;



function handleServerResponse(responseCode, title, data) {


    // var responseWoocomerce = response.status;

    if (responseCode === 200) {

        try {

            displayToast('Product ' + title + '  imported successfully', 'green');
        } catch (e) {
            displayToast('exception during import', 'red');
        }

        jQuery('.loader2').css({
            "display": "none"
        });

    } else if (responseCode == 0) {
        // stopLoadingError();
        displayToast('Error establishing connection to server This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things', 'red');

        jQuery('.loader2').css({
            "display": "none"
        });
    } else if (responseCode == 500) {
        displayToast('The server encountered an unexpected condition which prevented it from fulfilling the request, please try again or inform us by email wooebayimporter@gmail.com', 'red');
        jQuery('.loader2').css({
            "display": "none"
        });
    } else if (responseCode == 413) {
        displayToast('The server is refusing to process a request because the request entity is larger than the server is willing or able to process. The server MAY close the connection to prevent the client from continuing the request.', 'red');
        jQuery('.loader2').css({
            "display": "none"
        });
    } else if (responseCode == 504) {
        displayToast('Gateway Timeout Error, the server, acting as a gateway, timed out waiting for another server to respond', 'red');
        jQuery('.loader2').css({
            "display": "none"
        });
    } else if (data) {

        displayToast(data, 'red');
        jQuery('.loader2').css({
            "display": "none"
        });


    } else {
        displayToast('Error while inserting the product', 'red');
        jQuery('.loader2').css({
            "display": "none"
        });
    }




}






let waitingListProducts = [];

function importProducts() {
    // var count = 1;
    if (waitingListProducts && waitingListProducts.length) {
        // let clientKey = 'ck_25ff9ec9d8c298fbc3c9834304993826cafbddd4'
        // let clientSecretKey = 'cs_564d3f83d2feaf0b125a1d66a3b9cb8e72c6ec90'
        // let clientWebsite = 'https://wooproductimporter.fr '

        try {

            var website = jQuery('#website').val().trim();
            var key_client = jQuery('#key_client').val().trim();
            var sec_client = jQuery('#sec_client').val().trim();
        } catch {
            displayToast('Error while colleting connection details')
        }

        var statusCode;


        fetch(hostname + ":8008/wordpress", {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'POST',
            body: JSON.stringify({
                aliExpressProduct: waitingListProducts[0],
                isVariationImage: true,
                isPublish: true,
                clientWebsite: website,
                clientKey: key_client,
                clientSecretKey: sec_client
            })
        }).then(response => {
            statusCode = response.status;
            return response.json()
        })




        .then(contents => {
            handleServerResponse(statusCode, waitingListProducts[0].title, contents.data);
            // if(contents){

            //     try{

            //         // var jsonResponse = JSON.parse(contents)
            //         // console.log('----------------', jsonResponse.data)
            //         // handleServerResponse(contents, jsonResponse);
            //     }catch(e){
            //         displayToast('Error during information retrieval');
            //     }
            // }else{
            //     displayToast('Platform error, please contact wooshark support');
            // }


        })

        .catch((r) => {
            displayToast('Cannot insert product into shop', 'red')
            jQuery('.loader2').css({
                "display": "none"
            });
        })
    }
}


// function myFunction() {
//     // alert('hhhhh')
//     var $iframe = jQuery('#myiframe');
//     if ( $iframe.length ) {
//         $iframe.attr('src',url);   
//         return false;
//     }
//     return true;
//   }

// var productId = jQuery('div[data-js-id_product]').attr('data-js-id_product');



function getTitle(data) {
    var title = jQuery(data).find("span[itemprop='name']").text();
    return title;
}

function getprice(data) {
    var price = jQuery(data).find("span[itemprop='price']").text();
    return parseInt(price);
}



function getDescription(data) {
    var description = jQuery(data).find('.productDescription-content').text();

    descriptionContentFromUrl = jQuery(data).find('.productDescription-content').text();
    return descriptionContentFromUrl;
}

function getImages(data) {

    images = [];
    var imagesHtml = jQuery(data).find('.imgBox-thumb');
    imagesHtml.forEach(function(item) {
        // _.each(imagesHtml, function(item) {
        if (item && item.href) {
            images.push(item.href)
        }
    });
    return images
}


function getProductId(data) {
    return jQuery(data).find('[data-js-id_product]').attr('data-js-id_product');
}


function prepareProductDetails($data, data, productId, productUrl, reviews) {

    var title = getTitle(data);
    var price = getprice(data);
    var images = getImages(data);
    var productId = getProductId(data);
    var description = getDescription(data);
    var quantity = jQuery(data).find('[data-js-stock_quantity]').attr('data-js-stock_quantity') > -1 ? jQuery(data).find('[data-js-stock_quantity]').attr('data-js-stock_quantity') : 1;
    var scripts = $data.find("script");


    try {
        var transitObject1 = {
            title: title,
            description: description || '',
            images: images,
            productUrl: productUrl,
            scripts: scripts,
            $data: $data,
            productId: productId,
            quantity: quantity,
            price: price
        }
        createAliexpressProduct(transitObject1, false);




    } catch {
        displayToast('need Aliexpress website verification', 'red');
        jQuery('.loader2').css({
            "display": "none"
        });
        setTimeout(function() {
            var win = window.open(productUrl, '_blank');
            win.focus();
        }, 2000)
    }



}








jQuery(document).on("click", "#importProductToShopByUrlBigbuy", function(event) {



    var productUrl = jQuery('#productUrl').val();

    if (productUrl) {
        jQuery('.loader2').css({
            "display": "block",
            "background-color": "black"

        });
        // var productUrl = 'https://aliexpress.com/item/' + productId + '.html';
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const url = productUrl; // site that doesn’t send Access-Control-*
        fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
            .then(response => response.text())
            .then(contents => {
                console.log(contents);
                var $data = jQuery(contents)
                console.log(contents);
                prepareProductDetails($data, contents, 'productId', productUrl, []);
            })
            .catch((e) => {
                console.log(e);

                console.log("Can’t access " + url + " response. Blocked by browser?")
                jQuery('.loader2').css({
                    "display": "none"
                });
                displayToast('Error while getting product details', 'red');

            })
    } else {
        displayToast('Cannot get product sku', 'red');
    }

})


function save_options(website, key_client, sec_client) {

    // var website = document.getElementsByClassName('website')[0].value.trim();

    // var key_client = document.getElementsByClassName('key_client')[0].value.trim();

    // var sec_client = document.getElementsByClassName('sec_client')[0].value.trim();

    if (website && key_client && sec_client) {
        localStorage.setItem('website', website);
        localStorage.setItem('key_client', key_client);
        localStorage.setItem('sec_client', sec_client);
    }
}

// document.addEventListener('DOMContentLoaded', restore_options);

jQuery(document).ready(function() {
    restore_options();
});

function restore_options() {
    // editDescription();
    // Use default value color = 'red' and likesColor = true.

    // restoreFormula();

    // chrome.storage.local.get(['website', 'key_client', 'sec_client', 'bulkConfig', 'generalPreferences', 'savedCategories', 'chkArray', 'selectedCategoriesPreferences']

    // , function (items) {

    var website, key_client, sec_client;


    website = localStorage.getItem('website');
    key_client = localStorage.getItem('key_client');
    sec_client = localStorage.getItem('sec_client');

    document.getElementsByClassName('website')[0].value = website || '';
    document.getElementsByClassName('key_client')[0].value = key_client || '';
    document.getElementsByClassName('sec_client')[0].value = sec_client || '';


    // jQuery('#website').val(website);
    // jQuery('#key_client').val(key_client);
    // jQuery('#sec_client').val(sec_client);




    // });
}


function displayToast(data, color) {

    jQuery.toast({
        text: data,
        // It can be plain, fade or slide
        bgColor: 'white', // Background color for toast
        textColor: color, // text color
        hideAfter: 5000,
        stack: 5, // `false` to show one stack at a time count showing the number of toasts that can be shown at once
        textAlign: 'left', // Alignment of text i.e. left, right, center
        position: 'bottom-right' // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
    })

}





jQuery(document).on("click", "#connectToStore", function(event) {
    jQuery('.loader').css({
        "display": "block",
        "background-color": "black"

    });

    var website = jQuery('#website').val().trim();
    var key_client = jQuery('#key_client').val().trim();
    var sec_client = jQuery('#sec_client').val().trim();

    save_options(website, key_client, sec_client);



    var xmlConnect = new XMLHttpRequest();
    xmlConnect.onreadystatechange = function() {
        if (xmlConnect.readyState == 4) {
            // console.log(readBody(xmlConnect));
            var responseWoocomerce = xmlConnect.status;
            if (responseWoocomerce === 200) {
                jQuery('.loader').css({
                    "display": "none"
                });


                // window.open('https://www.aliexpress.com/', '_blank');
                displayToast('Connected successfully', 'green');
                jQuery('#isConnectedArea').css("background-color", "green");
                // getCategories(website, key_client, sec_client);


            } else if (responseWoocomerce === 0) {
                displayToast('Error establishing connection to host ' + website + ' This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things, disable other chrome extensions one by one and try again 3- Installed plugin that prevent the connection to your host (security plugins, cache plugins, etc..', 'red')

                jQuery('#isConnectedArea').css("background-color", "red");

                jQuery('.loader').css({
                    "display": "none"
                });

            } else {
                jQuery('#isConnectedArea').css("background-color", "red");

                if (xmlConnect.response && xmlConnect.response && xmlConnect.response.length > 13) {
                    try {
                        var data = JSON.parse(xmlConnect.response).data;
                        displayToast('Error establishing connection to host ' + website + '  ' + data, 'red');


                    } catch (e) {
                        displayToast('Error establishing connection to host ' + website, 'red');




                    }
                } else {

                    displayToast('Error establishing connection to host ' + website + ' wordpress url is not valid', 'red');

                    jQuery('.loader').css({
                        "display": "none"
                    });

                }



                jQuery('.loader').css({

                    "display": "none"

                });



            }

        }

    };

    xmlConnect.open("POST", hostname + ":8008/authentification", true);
    xmlConnect.setRequestHeader("Content-Type", "application/json");

    xmlConnect.send(JSON.stringify({
        premuimExtension: false,
        clientWebsite: website,
        clientKey: key_client,
        clientSecretKey: sec_client
    }));



})