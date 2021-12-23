// adds unique ids to specified dom elements to enable easier testing

function getApp() {
    return $('.uv iframe').contents().find('#app');
}

function getHeaderPanel() {
    return getApp().find('.headerPanel');
}

function getMainPanel() {
    return getApp().find('.mainPanel');
}

function getLeftPanel() {
    return getMainPanel().find('.leftPanel');
}

function getCenterPanel() {
    return getMainPanel().find('.centerPanel');
}

function getRightPanel() {
    return getMainPanel().find('.rightPanel');
}

function getFooterPanel() {
    return getApp().find('.footerPanel');
}

function getOverlays() {
    return getApp().find('.overlays');
}

var ids = [
    {
        id: 'fullScreenBtn',
        path: function() {
            return getFooterPanel().find('.options .fullScreen');
        }
    },
    {
        id: 'moreInfoExpandBtn',
        path: function() {
            return getRightPanel().find('.closed .title');
        }
    },
    {
        id: 'moreInfoCollapseBtn',
        path: function() {
            return getRightPanel().find('.top .title');
        }
    },
    {
        id: 'contentsExpandBtn',
        path: function() {
            return getLeftPanel().find('.closed .title');
        }
    },
    {
        id: 'contentsCollapseBtn',
        path: function() {
            return getLeftPanel().find('.top .title');
        }
    },
    {
        id: 'metaDataTitle',
        path: function() {
            return getRightPanel().find('.main .items .title .header');
        }
    },
    {
        id: 'metaDataTitleText',
        path: function() {
            return getRightPanel().find('.main .items .title .text');
        }
    },
    {
        id: 'metaDataTitleMore',
        path: function() {
            return getRightPanel().find('.main .items .title .text .more');
        }
    },
    {
        id: 'metaDataTitleLess',
        path: function() {
            return getRightPanel().find('.main .items .title .text .less');
        }
    },
    {
        id: 'metaDataPlace',
        path: function() {
            return getRightPanel().find('.main .items .place .header');
        }
    },
    {
        id: 'metaDataPlaceText',
        path: function() {
            return getRightPanel().find('.main .items .place .text');
        }
    },
    {
        id: 'metaDataDate',
        path: function() {
            return getRightPanel().find('.main .items .date .header');
        }
    },
    {
        id: 'metaDataDateText',
        path: function() {
            return getRightPanel().find('.main .items .date .text');
        }
    },
    {
        id: 'metaDataCollection',
        path: function() {
            return getRightPanel().find('.main .items .collection .header');
        }
    },
    {
        id: 'metaDataCollectionText',
        path: function() {
            return getRightPanel().find('.main .items .collection .text');
        }
    },
    {
        id: 'metaDataAuthor',
        path: function() {
            return getRightPanel().find('.main .items .author .header');
        }
    },
    {
        id: 'metaDataAuthorText',
        path: function() {
            return getRightPanel().find('.main .items .author .text');
        }
    },
    {
        id: 'metaDataDescription',
        path: function() {
            return getRightPanel().find('.main .items .description .header');
        }
    },
    {
        id: 'metaDataDescriptionText',
        path: function() {
            return getRightPanel().find('.main .items .description .text');
        }
    },
    {
        id: 'metaDataAttribution',
        path: function() {
            return getRightPanel().find('.main .items .attribution .header');
        }
    },
    {
        id: 'metaDataAttributionText',
        path: function() {
            return getRightPanel().find('.main .items .attribution .text');
        }
    },
    {
        id: 'metaDataAttributionMore',
        path: function() {
            return getRightPanel().find('.main .items .attribution .text .more');
        }
    },
    {
        id: 'metaDataAttributionLess',
        path: function() {
            return getRightPanel().find('.main .items .attribution .text .less');
        }
    },
    {
        id: 'metaDataLicense',
        path: function() {
            return getRightPanel().find('.main .items .license .header');
        }
    },
    {
        id: 'metaDataLicenseText',
        path: function() {
            return getRightPanel().find('.main .items .license .text');
        }
    },
    {
        id: 'lastPageBtn',
        path: function() {
            return getHeaderPanel().find('.nextOptions .last');
        }
    },
    {
        id: 'previousPageBtn',
        path: function() {
            return getHeaderPanel().find('.prevOptions .prev');
        }
    },
    {
        id: 'nextPageBtn',
        path: function() {
            return getHeaderPanel().find('.nextOptions .next');
        }
    },
    {
        id: 'firstPageBtn',
        path: function() {
            return getHeaderPanel().find('.prevOptions .first');
        }
    },
    {
        id: 'imageRadioButton',
        path: function() {
            return getHeaderPanel().find('#image');
        }
    },
    {
        id: 'pageRadioButton',
        path: function() {
            return getHeaderPanel().find('#page');
        }
    },
    {
        id: 'pageEditField',
        path: function() {
            return getHeaderPanel().find('.searchText');
        }
    },
    {
        id: 'goBtn',
        path: function() {
            return getHeaderPanel().find('.go');
        }
    },
    {
        id: 'settingsBtn',
        path: function() {
            return getHeaderPanel().find('.settings');
        }
    },
    {
        id: 'closeSettingsBtn',
        path: function() {
            return getOverlays().find('.overlay.settings .close');
        }
    },
    {
        id: 'localeSelect',
        path: function() {
            return getOverlays().find('.overlay.settings #locale');
        }
    },
    {
        id: 'pagingEnabledCheckbox',
        path: function() {
            return getOverlays().find('.overlay.settings #pagingEnabled');
        }
    },
    {
        id: 'indexTab',
        path: function() {
            return getLeftPanel().find('.index.tab');
        }
    },
    {
        id: 'thumbsTab',
        path: function() {
            return getLeftPanel().find('.thumbs.tab');
        }
    },
    {
        id: 'canvasNextBtn',
        path: function() {
            return getCenterPanel().find('.btn.next');
        }
    },
    {
        id: 'canvasPrevBtn',
        path: function() {
            return getCenterPanel().find('.btn.prev');
        }
    },
    {
        id: 'acknowledgements',
        path: function() {
            return getCenterPanel().find('.rights');
        }
    }];

function createTestIds() {

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        id.path().prop('id', id.id);
    }

}