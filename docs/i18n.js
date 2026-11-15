'use strict';
/* Stable filter keys and section IDs are shared by the two versions. */
const nmpLanguageLink = document.querySelector('.nmp-language');
if(nmpLanguageLink) {
 const otherLanguagePage = new URL(nmpLanguageLink.href);
 const syncLanguageLink = () => {
  otherLanguagePage.search = location.search;
  otherLanguagePage.hash = location.hash;
  nmpLanguageLink.href = otherLanguagePage.href;
 };
 syncLanguageLink();
 addEventListener('popstate',syncLanguageLink);
 addEventListener('hashchange',syncLanguageLink);
 addEventListener('pointerdown',syncLanguageLink,{capture:true,passive:true});
 nmpLanguageLink.addEventListener('focus',syncLanguageLink);
 nmpLanguageLink.addEventListener('click',syncLanguageLink);
}
