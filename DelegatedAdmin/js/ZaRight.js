/**
 * Rights object:
 *  {
 *      name: AComboRight ,
 *      id: 3ajbkdaksfeekrwklkadfkdslk
 *      attrs: {
 *          name: AComboRight ,
 *          id: 3ajbkdaksfeekrwklkadfkdslk ,
 *          type: combo ,
 *          targetType: [ "cos", "account"] ,
 *          rights: [ CreateAccount, SetPassword ] ,
 *          attrs: [only for  setAttrs, getAttrs]
 *
 *      }
 * }
 *
 *
 *
 *
 */

ZaRight = function() {
	ZaItem.call(this, "ZaRight");
	this._init();
	//The type is required. The application tab uses it to show the right icon
	this.type = ZaItem.RIGHT ;
    this.attrs = {} ; //used to keep the right object properties
}

ZaRight.prototype = new ZaItem;
ZaRight.prototype.constructor = ZaRight;
ZaItem.loadMethods["ZaRight"] = new Array();
ZaItem.initMethods["ZaRight"] = new Array();
ZaItem.modifyMethods["ZaRight"] = new Array();

ZaRight.A_id = "id" ;
ZaRight.A_name = "name" ;
ZaRight.A_desc = "desc" ;
ZaRight.A_attrs = "attrs" ;
ZaRight.A_rights = "rights" ;
ZaRight.A_type = "type" ;
ZaRight.A_targetType = "targetType"  ;
ZaRight.A_definedBy = "definedBy" ;


ZaRight.A2_selected_rights = "selected_rights";

//@return the lists of rights for the type specified
ZaRight.getCustomRightsList = function () {
    //TODO: since we can also create the getAttrs and setAttrs rights, we actually need to use the SOAP command to get the lists of rights   
    var customRights = [] ;

    for (var i = 0 ; i < 10 ; i ++) {
        var right = new ZaRight () ;
        var type ;
        var j = i % ZaZimbraRights.type.length ;
        if (j == 0) {
            type = "combo" ; //no preset for the customRights
        } else {
            type = ZaZimbraRights.type [j] ;
        }
        right.name = "CustomRight" + i ;
        right.attrs = {
            name: "CustomRight" + i ,
            type: type ,
            desc: "Prototype Custom Right " + i
        }

        var targetType ;
        if (type == "getAttrs") {
            targetType = [ "account", "cos" ] ;
            right.attrs.attrs = ["zimbraMailQuota", "zimbraQuotaWarnPercent",
                "zimbraQuotaWarnInterval", "zimbraQuotaWarnMessage"] ;
        } else if (type == "setAttrs"){
            targetType = [ "domain" ];
            right.attrs.attrs = ["zimbraFeatureIMEnabled", "zimbraFeatureCalendarEnabled",
                "zimbraFeatureMailEnabled"] ;
        } else if (type == "combo") {
            right.attrs.rights = ["createAccount", "renameAccount", "configureQuotaWithinLimit"]  ;
        }
        if (targetType) right.attrs.targetType = targetType ;
        customRights.push(right) ;
    }
//    var resp = {right: customRights };
    var list = new ZaItemList(ZaRight);
    list._vector =    AjxVector.fromArray(customRights)  ;

    return list;
}

ZaRight.rightsOvTreeModifier = function (tree) {
    var overviewPanelController = this ;
    if (!overviewPanelController) throw new Exception("ZaRight.rightsOvTreeModifier: Overview Panel Controller is not set.");

    if(ZaSettings.RIGHTS_ENABLED) {
        overviewPanelController._rightsTi = new DwtTreeItem(overviewPanelController._configTi);
        overviewPanelController._rightsTi.setText(com_zimbra_delegatedadmin.OVP_rights);
        overviewPanelController._rightsTi.setImage("Account"); //TODO: Use Rights icons
		overviewPanelController._rightsTi.setData(ZaOverviewPanelController._TID, ZaZimbraAdmin._RIGHTS_LIST_VIEW);
       /*
        try {
            var ti1 = new DwtTreeItem( overviewPanelController._rightsTi );
            ti1.setText(com_zimbra_delegatedadmin.TI_custom_rights);
            ti1.setImage("Server");
            ti1.setData(ZaOverviewPanelController._TID, ZaZimbraAdmin._RIGHTS_LIST_VIEW);
//            ti1.setData(ZaOverviewPanelController._OBJ_ID, serverList[ix].id);

        } catch (ex) {
            overviewPanelController._handleException(ex, "ZaRigth.rightsOvTreeModifier", null, false);
        }*/

        if(ZaOverviewPanelController.overviewTreeListeners) {
            ZaOverviewPanelController.overviewTreeListeners[ZaZimbraAdmin._RIGHTS_LIST_VIEW] = ZaRight.customRightsListTreeListener;
//            ZaOverviewPanelController.overviewTreeListeners[ZaZimbraAdmin._CERTS] = ZaCert.certsRightNodeTreeListener;
        }
    }
}

ZaRight.customRightsListTreeListener = function (ev) {
	if (AjxEnv.hasFirebug) console.log("Show the custom rigths lists ...") ;
	if(ZaApp.getInstance().getCurrentController()) {
		ZaApp.getInstance().getCurrentController().switchToNextView(
			ZaApp.getInstance().getRightsListController(),ZaRightsListViewController.prototype.show, ZaRight.getCustomRightsList());
	} else {
		ZaApp.getInstance().getRightsListController().show(ZaRights.getCustomRightsList());
	}
}
ZaRight.myXModel = {
	items: [
        {id: ZaRight.A_id, ref:  ZaRight.A_id, type: _STRING_},
        {id: ZaRight.A_name, ref: ZaRight.A_name, type: _STRING_, required: true},
        {id: ZaRight.A_type, ref: "attrs/" + ZaRight.A_type, type: _ENUM_, choices: ZaZimbraRights.type },
            //TODO: have a new choice list xform item to display the targetType
        {id: ZaRight.A_targetType, ref: "attrs/" + ZaRight.A_targetType, type: _LIST_, choices: ZaZimbraRights.targetType },
        {id: ZaRight.A_desc, ref: "attrs/" + ZaRight.A_desc, type: _STRING_ },
        {id: ZaRight.A_definedBy, ref: "attrs/" + ZaRight.A_definedBy, type: _ENUM_, choices: ZaZimbraRights.definedBy },
        {id: ZaRight.A_attrs,  ref: "attrs/" + ZaRight.A_attrs, type: _LIST_, listItem:{type:_STRING_}} ,
        {id: ZaRight.A_rights,  ref: "attrs/" + ZaRight.A_rights, type: _LIST_, listItem:{type:_STRING_}}
    ]
};

ZaRight.prototype.toString = function() {
	return this.name;
}

ZaRight.getAll =
function() {
	var soapDoc = AjxSoapDoc.create("GetAllRightsRequest", ZaZimbraAdmin.URN, null);
//	var command = new ZmCsfeCommand();
	var params = new Object();
	params.soapDoc = soapDoc;
	params.asyncMode=false;
	var reqMgrParams = {
		controller : ZaApp.getInstance().getCurrentController(),
		busyMsg : ZaMsg.BUSY_GET_ALL_RIGHT
	}
	var resp = ZaRequestMgr.invoke(params, reqMgrParams).Body.GetAllRightsResponse;
	var list = new ZaItemList(ZaRight);
	list.loadFromJS(resp);
	return list;
}

ZaRight.modifyMethod = function (tmpObj) {

}
ZaItem.modifyMethods["ZaRight"].push(ZaRight.modifyMethod);


/**
* Returns HTML for a tool tip for this domain.
*/
ZaRight.prototype.getToolTip =
function() {
	// update/null if modified
	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
		html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black; white-space:nowrap; overflow:hidden;width:350'>";
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' style='width:100%;'>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>" + AjxStringUtil.htmlEncode(this.name) + "</b></td>";
		html[idx++] = "<td align='right'>";
		html[idx++] = AjxImg.getImageHtml("Right");
		html[idx++] = "</td>";
		html[idx++] = "</table></div></td></tr>";
		html[idx++] = "<tr></tr>";
		idx = this._addAttrRow(ZaRight.A_desc, com_zimbra_delegatedadmin.Col_right_desc + ": ", html, idx);
		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
}

// Adds a row to the tool tip.
ZaRight.prototype._addAttrRow =
function(name, label, html, idx) {
	var value = this.attrs[name];
	if (value != null) {
		html[idx++] = "<tr valign='top'><td align='left' style='padding-right: 5px;'><b>";
		html[idx++] = AjxStringUtil.htmlEncode(label) ;
		html[idx++] = "</b></td><td align='left'><div style='white-space:nowrap; overflow:hidden;'>";
		html[idx++] = AjxStringUtil.htmlEncode(value);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
}



ZaRight.prototype.remove =
function() {
	var soapDoc = AjxSoapDoc.create("DeleteRightRequest", ZaZimbraAdmin.URN, null);
	soapDoc.set("id", this.id);
	//var command = new ZmCsfeCommand();
	var params = new Object();
	params.soapDoc = soapDoc;
	var reqMgrParams = {
		controller : ZaApp.getInstance().getCurrentController(),
		busyMsg : ZaMsg.BUSY_DELETE_RIGHT
	}
	var resp = ZaRequestMgr.invoke(params, reqMgrParams);
}

ZaRight.prototype.refresh =
function() {
	this.load();
}


ZaRight.loadMethod =
function(by, val, withConfig) {
// prototype empty return  
    return ;
    
    var _by = by ? by : "id";
	var _val = val ? val : this.id
	var soapDoc = AjxSoapDoc.create("GetRightRequest", ZaZimbraAdmin.URN, null);
	
	var elBy = soapDoc.set("server", _val);
	elBy.setAttribute("by", _by);
	//var command = new ZmCsfeCommand();
	var params = new Object();
	params.soapDoc = soapDoc;
	params.asyncMode = false;
	var reqMgrParams = {
		controller : ZaApp.getInstance().getCurrentController(),
		busyMsg : ZaMsg.BUSY_GET_RIGHT
	}
	resp = ZaRequestMgr.invoke(params, reqMgrParams);
    this.initFromJS(resp.Body.GetRightResponse.server[0]);

}
ZaItem.loadMethods["ZaRight"].push(ZaRight.loadMethod);



ZaRight.prototype.initFromJS = function(right) {
	ZaItem.prototype.initFromJS.call(this, right);
	// convert installed/enabled services to hidden fields for xform binding
	var installed = this.attrs[ZaRight.A_zimbraServiceInstalled];
	if (installed) {
		if (AjxUtil.isString(installed)) {
			installed = [ installed ];
		}
		for (var i = 0; i < installed.length; i++) {
			var service = installed[i];
			this.attrs["_"+ZaRight.A_zimbraServiceInstalled+"_"+service] = true;
			this.attrs["_"+ZaRight.A_zimbraServiceEnabled+"_"+service] = false;
		}
	}

	var enabled = this.attrs[ZaRight.A_zimbraServiceEnabled];
	if (enabled) {
		if (AjxUtil.isString(enabled)) {
			enabled = [ enabled ];
		}
		for (var i = 0; i < enabled.length; i++) {
			var service = enabled[i];
			this.attrs["_"+ZaRight.A_zimbraServiceEnabled+"_"+service] = true;
		}
	}
	this[ZaRight.A_ServiceHostname] = this.attrs[ZaRight.A_ServiceHostname]; // a hack for New Account Wizard
	this[ZaRight.A_showVolumes] = this.attrs[ZaRight.A_zimbraMailboxServiceEnabled];
}

ZaRight.initMethod = function () {
	this.attrs = new Object();
	this.id = "";
	this.name="";
}
ZaItem.initMethods["ZaRight"].push(ZaRight.initMethod);