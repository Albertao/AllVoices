// 虾米音乐url破解算法，参见
// https://github.com/Flowerowl/xiami/blob/master/xiami.php
export default function xmEnc(location){
        var loc_2 = location.substr(0, 1);
        var loc_3 = location.substr(1);
        var loc_4 = Math.floor(loc_3.length / loc_2);
        var loc_5 = loc_3.length % loc_2;
        var loc_6 = [];
        var loc_7 = 0;
        var loc_8 = '';
        var loc_9 = '';
        var loc_10 = '';
        while (loc_7 < loc_5){
            loc_6[loc_7] = loc_3.substr((loc_4+1)*loc_7, loc_4+1);
            loc_7++;
        }
        loc_7 = loc_5;
        while(loc_7 < loc_2){
            loc_6[loc_7] = loc_3.substr(loc_4 * (loc_7 - loc_5) + (loc_4 + 1) * loc_5, loc_4);
            loc_7++;
        }
        loc_7 = 0;
        console.log(loc_6)
        while (loc_7 < loc_6[0].length){
            loc_10 = 0;
            while (loc_10 < loc_6.length){
                loc_8 += (loc_6[loc_10][loc_7] === null) ? null : ((loc_6[loc_10][loc_7] === undefined) ? '' : loc_6[loc_10][loc_7]);
                loc_10++;
            }
            loc_7++;
        }
        loc_9 = decodeURIComponent(loc_8);
        var real_url = loc_9.replace(/\^/g, 0);
        return real_url;
}