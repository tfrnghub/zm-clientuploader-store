//this is the permission tab view for each target
/*targets: 
    - account
    - calendar resource
    - cos
    - distribution list
    - domain
    - global config
    - global grant
    - right (TODO)
    - server
    - xmppcomponent
    - zimlet
*/


ZaTargetPermission = function () {} ;

//Mini Grants List View 
ZaGrantsListView = function(parent, className, posStyle, headerList) {
    if (arguments.length == 0) return;
	var className = className || null;
	var posStyle = posStyle || DwtControl.STATIC_STYLE;
	var headerList = headerList || ZaGrantsListView._getHeaderList();

	ZaListView.call(this, parent, className, posStyle, headerList);
	this._appCtxt = this.shell.getData(ZaAppCtxt.LABEL);
    //disable the multiselect for Grants List view
    this.setMultiSelect(false) ;
}

ZaGrantsListView.prototype = new ZaListView;
ZaGrantsListView.prototype.constructor = ZaGrantsListView;

ZaGrantsListView.prototype.toString =
function() {
	return "ZaGrantsListView";
}

//the tab title and icon are only requried in global grants
//therefore their content is for global grants only
ZaGrantsListView.prototype.getTitle =
function () {
	return com_zimbra_delegatedadmin.GlobalGrants_view_title;
}

ZaGrantsListView.prototype.getTabIcon =
function () {
	return "Server";
}

ZaGrantsListView.prototype._createItemHtml =
function(grant, now, isDragProxy) {
	var html = new Array(50);
	var	div = document.createElement("div");
	div[DwtListView._STYLE_CLASS] = "Row";
	div[DwtListView._SELECTED_STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + "-" + DwtCssStyle.SELECTED;
	div.className = div[DwtListView._STYLE_CLASS];
	this.associateItemWithElement(grant, div, DwtListView.TYPE_LIST_ITEM);

	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";
	html[idx++] = "<tr>";
	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var field = this._headerList[i]._field;

        html[idx++] = "<td align='left' width=" + this._headerList[i]._width + "><nobr>";
        if (field == ZaGrant.A_deny) {
            if (grant [field] && grant [field] == "1") {
                html[idx++] = ZaMsg.Yes ;
            }else {
                html[idx++] = ZaMsg.No ;    
            }

        }  else {
            html[idx++] = AjxStringUtil.htmlEncode(grant [field]) ;
        }
        html[idx++] = "</nobr></td>" ;
	}
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

ZaGrantsListView._getHeaderList =
function() {
	var headerList = [];
//idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible
	var sortable=1;
	headerList[0] = new ZaListHeaderItem(ZaGrant.A_grantee, com_zimbra_delegatedadmin.Col_grantee_name,
            null, 200, null, ZaGrant.A_grantee, true, true);

	headerList[1] = new ZaListHeaderItem(ZaGrant.A_grantee_type, com_zimbra_delegatedadmin.Col_grantee_type,
            null, 100, null  , ZaGrant.A_grantee_type, true, true);

    headerList[2] = new ZaListHeaderItem(ZaGrant.A_deny, com_zimbra_delegatedadmin.Col_deny,
                null, 150, null , ZaGrant.A_deny, true, true);

    headerList[3] = new ZaListHeaderItem(ZaGrant.A_right, com_zimbra_delegatedadmin.Col_grant_right_name,
                    null, null, null , ZaGrant.A_right, true, true);

    return headerList;
}


ZaGrantsListView.isDeleteEnabled = function () {
    var grantListItem = this.getForm().getItemsById (ZaGrant.A2_grantsList) [0] ;
    if (grantListItem && grantListItem.getSelection ()
            && grantListItem.getSelection ().length > 0) { 
        return true ;
    } else {
        return true ;    //TODO: somehow the delete button enabling is not working with enableDisableChecks condition
    }
}

ZaGrantsListView.revokeRight = function () {
    var selectedGrants = this.getItemsById (ZaGrant.A2_grantsList) [0].getSelection() ;
    if (selectedGrants && selectedGrants.length > 0) {
        var instance = this.getInstance();
        var targetInfo = {} ;
        targetInfo [ZaGrant.A_target] = instance.name ;
        targetInfo [ZaGrant.A_target_type] = instance.type ;
        var currentGrantList = instance [ZaGrant.A2_grantsList] ;

        for (var i = 0; i < selectedGrants.length; i ++) {
// TODO: when multiselection enabled, we need a progress dialog to show the progress
            if (ZaGrant.revokeMethod (targetInfo, selectedGrants[i])) {
                var j = ZaTargetPermission.findIndexOfGrant(currentGrantList, selectedGrants[i]);
                currentGrantList.splice(j, 1) ;
            } else {
                break ; //jump out if failed.
            }
        }
        this.getModel().setInstanceValue(instance, ZaGrant.A2_grantsList, currentGrantList);
    }

    this.parent.revokeRightDlg.popdown () ;
}

ZaGrantsListView.revokeGlobalGrant = function () {
    var selectedGrants = this._contentView.getSelection() ;
    if (selectedGrants && selectedGrants.length > 0) {
        var targetInfo = {} ;
        targetInfo [ZaGrant.A_target] = "" ;
        targetInfo [ZaGrant.A_target_type] = "global" ;

        for (var i = 0; i < selectedGrants.length; i ++) {
// TODO: when multiselection enabled, we need a progress dialog to show the progress
            if (ZaGrant.revokeMethod (targetInfo, selectedGrants[i])) {
// fire the removal event.               
                this.fireRemovalEvent (selectedGrants[i]) ;
            } else {
                break ; //jump out if failed.
            }
        }
    }

    this.revokeRightDlg.popdown () ;
}

ZaGrantsListView.grantSelectionListener = function () {
    var instance = this.getForm().getInstance () ;
    var selectedGrants = this.widget.getSelection () ;
    this.getModel().setInstanceValue (instance,
            ZaGrant.A2_grantsListSelectedItems, selectedGrants) ;
}

var grantListItem = {
    id: ZaGrant.A2_grantsList, ref: ZaGrant.A2_grantsList, type: _LIST_,
    listItems: { type: _OBJECT_, items:
        [
            {id: ZaGrant.A_grantee, type: _STRING_, ref: ZaGrant.A_grantee, required: true },    
            {id: ZaGrant.A_grantee_type, type:_LIST_, ref:  ZaGrant.A_grantee_type, required: true, choices: ZaGrant.GRANT_TYPE},
            {id: ZaGrant.A_right, type: _STRING_, ref:  ZaGrant.A_right, required: true },
            {id: ZaGrant.A_deny, type:_ENUM_, ref: ZaGrant.A_deny, choices:ZaModel.BOOLEAN_CHOICES2 }
        ]
    }
};

var grantsListXFormItem  =  {
    ref: ZaGrant.A2_grantsList, id: ZaGrant.A2_grantsList, type: _DWT_LIST_, width:700, height: 200,
    cssClass: "DLSource", widgetClass: ZaGrantsListView,
    headerList: ZaGrantsListView._getHeaderList (),
    hideHeader: false ,
    onSelection:ZaGrantsListView.grantSelectionListener,
    multiselect: false  //TODO: enable multiselect in the future
} ;

ZaTargetPermission.targetXFormModifier = function (xFormObject) {
    var tabBar, switchGroup ;
    for (var i=0; i < xFormObject.items.length; i ++) {
        if (xFormObject.items[i].type == _TAB_BAR_) {
            tabBar = xFormObject.items[i] ;
        }

        if (xFormObject.items[i].type == _SWITCH_) {
            switchGroup = xFormObject.items[i]
        }
    }

    if (tabBar && switchGroup) {
        var tabIx = tabBar.choices.length + 1;
        tabBar.choices.push({value:tabIx, label: com_zimbra_delegatedadmin.Tab_permission}) ;
    }

    var caseItem =
        {type:_ZATABCASE_, id:"target_form_permission_tab", numCols:1, colSizes:["700px"],
            caseKey:  tabIx,
            items:[
               {type:_SPACER_, height: "10px" },
               {type:_OUTPUT_, value: com_zimbra_delegatedadmin.Label_permission },
               grantsListXFormItem ,
//                   {type:_CELLSPACER_},
               {type:_GROUP_, numCols:3,width: 350, colSizes:["100px","20px","*"],  height: 30,
                    cssStyle:"margin-bottom:10px;padding-bottom:0px;margin-top:10px;margin-left: 200px; margin-right:auto;",
                    items: [
                        {type:_DWT_BUTTON_, label:com_zimbra_delegatedadmin.Bt_grant,width:"100px",
                            onActivate:"ZaTargetPermission.grantButtonListener.call (this);",
                            align: _RIGHT_},
                        {type:_CELLSPACER_},
//                            {type:_DWT_BUTTON_, label:ZaMsg.TBB_Edit,width:"100px" },
//                            {type:_CELLSPACER_},
                        {type:_DWT_BUTTON_, label:com_zimbra_delegatedadmin.Bt_revoke,width:"100px", align: _LEFT_ ,
                            enableDisableChangeEventSources: [ZaGrant.A2_grantsListSelectedItems, ZaGrant.A2_grantsList] ,
                            enableDisableChecks:[ZaGrantsListView.isDeleteEnabled],
                            onActivate:"ZaTargetPermission.revokeButtonListener.call(this);"
                        }
                    ]
                }
            ]
        }
    switchGroup.items.push(caseItem);
}

ZaTargetPermission.permissionViewMethod =
function (entry) {

    if (entry[ZaGrant.A2_grantsList])  {
        this._view._containedObject[ZaGrant.A2_grantsList] = entry[ZaGrant.A2_grantsList] ;
        var xform = this._view._localXForm ;
        var instance  = xform.getInstance ();
        xform.getModel().setInstanceValue(instance, ZaGrant.A2_grantsList, entry[ZaGrant.A2_grantsList]);
    }
}


//TODO: add model and xform to the target's main view as a new tab - permissions
var grantListSelectItem = { ref: ZaGrant.A2_grantsListSelectedItems, type:_LIST_ }

//Domain Target
if (ZaDomain) {
    ZaDomain.myXModel.items.push(grantListItem) ;
    ZaDomain.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaDomainXFormView"]){
    ZaTabView.XFormModifiers["ZaDomainXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaDomain"]) {
    ZaItem.loadMethods["ZaDomain"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaDomainController"]) {
	ZaController.setViewMethods["ZaDomainController"].push(ZaTargetPermission.permissionViewMethod);
}

//Account Target
if (ZaAccount) {
    ZaAccount.myXModel.items.push(grantListItem) ;
    ZaAccount.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaAccountXFormView"]){
    ZaTabView.XFormModifiers["ZaAccountXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaAccount"]) {
    ZaItem.loadMethods["ZaAccount"].push (ZaGrant.loadMethod) ;
}

/*   Grant right and delete will be separated from the account modification
if (ZaItem.modifyMethods["ZaAccount"]) {
    ZaItem.modifyMethods["ZaAccount"].push(ZaGrant.grantMethod);
}
*/

if (ZaController.setViewMethods["ZaAccountViewController"]) {
	ZaController.setViewMethods["ZaAccountViewController"].push(ZaTargetPermission.permissionViewMethod);
}


//DL Target
if (ZaDistributionList) {
    ZaDistributionList.myXModel.items.push(grantListItem) ;
    ZaDistributionList.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaDLXFormView"]){
    ZaTabView.XFormModifiers["ZaDLXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaDistributionList"]) {
    ZaItem.loadMethods["ZaDistributionList"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaDLController"]) {
	ZaController.setViewMethods["ZaDLController"].push(ZaTargetPermission.permissionViewMethod);
}


//Resource target
if (ZaResource) {
    ZaResource.myXModel.items.push(grantListSelectItem) ;
    ZaResource.myXModel.items.push(grantListItem) ;
}

if (ZaTabView.XFormModifiers["ZaResourceXFormView"]){
    ZaTabView.XFormModifiers["ZaResourceXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaResource"]) {
    ZaItem.loadMethods["ZaResource"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaResourceController"]) {
	ZaController.setViewMethods["ZaResourceController"].push(ZaTargetPermission.permissionViewMethod);
}

//COS Target
if (ZaCos) {
    ZaCos.myXModel.items.push(grantListItem) ;
    ZaCos.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaCosXFormView"]){
    ZaTabView.XFormModifiers["ZaCosXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaCos"]) {
    ZaItem.loadMethods["ZaCos"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaCosController"]) {
	ZaController.setViewMethods["ZaCosController"].push(ZaTargetPermission.permissionViewMethod);
}

//GlobalConfig Target
if (ZaGlobalConfig) {
    ZaGlobalConfig.myXModel.items.push(grantListItem) ;
    ZaGlobalConfig.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["GlobalConfigXFormView"]){
    ZaTabView.XFormModifiers["GlobalConfigXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaGlobalConfig"]) {
    ZaItem.loadMethods["ZaGlobalConfig"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaGlobalConfigViewController"]) {
	ZaController.setViewMethods["ZaGlobalConfigViewController"].push(ZaTargetPermission.permissionViewMethod);
}

//Server Target
if (ZaServer) {
    ZaServer.myXModel.items.push(grantListItem) ;
    ZaServer.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaServerXFormView"]){
    ZaTabView.XFormModifiers["ZaServerXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaServer"]) {
    ZaItem.loadMethods["ZaServer"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaServerController"]) {
	ZaController.setViewMethods["ZaServerController"].push(ZaTargetPermission.permissionViewMethod);
}

//Zimlet Target
if (ZaZimlet) {
   ZaZimlet.myXModel.items.push(grantListItem) ;
    ZaZimlet.myXModel.items.push(grantListSelectItem) ;
}

if (ZaTabView.XFormModifiers["ZaZimletXFormView"]){
    ZaTabView.XFormModifiers["ZaZimletXFormView"].push(ZaTargetPermission.targetXFormModifier);
}

if (ZaItem.loadMethods["ZaZimlet"]) {
    ZaItem.loadMethods["ZaZimlet"].push (ZaGrant.loadMethod) ;
}

if (ZaController.setViewMethods["ZaZimletViewController"]) {
	ZaController.setViewMethods["ZaZimletViewController"].push(ZaTargetPermission.permissionViewMethod);
}

ZaTargetPermission.grantButtonListener =
function () {
    var instance = this.getInstance();
	var formPage = this.getForm().parent;
	if(!formPage.grantRightDlg) {
		formPage.grantRightDlg = new ZaGrantDialog (
                ZaApp.getInstance().getAppCtxt().getShell(),
                ZaApp.getInstance(), com_zimbra_delegatedadmin.Title_grant_rights);
		formPage.grantRightDlg.registerCallback(DwtDialog.OK_BUTTON, ZaGrantDialog.grantRight, this.getForm(), null);
	}

	var obj = {};
	obj[ZaGrant.A_target] = instance.name;
    obj[ZaGrant.A_target_type] = instance.type ;

    obj.setAttrs = {} ;
    obj.setAttrs.all = true ;
    formPage.grantRightDlg.setObject(obj);
	formPage.grantRightDlg.popup();
}

ZaTargetPermission.revokeButtonListener = function () {
    var instance = this.getInstance();
    var form = this.getForm () ;
    var formPage = form.parent;
    var selectedGrant = form.getItemsById (ZaGrant.A2_grantsList) [0].getSelection() ;
    if (selectedGrant && selectedGrant.length > 0) {
        if(!formPage.revokeRightDlg) {
            formPage.revokeRightDlg = new ZaMsgDialog (
                    ZaApp.getInstance().getAppCtxt().getShell(),
                    null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
        }
        formPage.revokeRightDlg.registerCallback(DwtDialog.YES_BUTTON, ZaGrantsListView.revokeRight, form, null);
        var confirmMsg =  com_zimbra_delegatedadmin.confirm_delete_grants + ZaTargetPermission.getDlMsgFromGrant(selectedGrant) ;
        formPage.revokeRightDlg.setMessage (confirmMsg,  DwtMessageDialog.INFO_STYLE) ;
        formPage.revokeRightDlg.popup ();
    } else {
        ZaApp.getInstance().getCurrentController().popupMsgDialog (com_zimbra_delegatedadmin.no_grant_selected_msg) ;
    }
}

ZaTargetPermission.getDlMsgFromGrant =
function (grantsList) {
	var dlgMsg =  "<br><table>";
    var keys = [ZaGrant.A_grantee,ZaGrant.A_right ,ZaGrant.A_deny] ;
    for (var i=0; i < grantsList.length; i ++) {
        var grant = grantsList [i] ;

        for (var j =0; j < keys.length; j ++) {
            var key = keys [j] ;
            dlgMsg += "<tr>";
            if (key ==ZaGrant.A_grantee)  {
                dlgMsg += "<td>" + com_zimbra_delegatedadmin.Col_grantee_name + ": " + "</td>";
                dlgMsg += "<td>" + grant[ZaGrant.A_grantee] + "</td>" ;
            } else if (key == ZaGrant.A_right) {
                dlgMsg += "<td>" + com_zimbra_delegatedadmin.Col_grant_right_name + ": " + "</td>";
                dlgMsg += "<td>" + grant[ZaGrant.A_right] + "</td>" ;
            } else if (key == ZaGrant.A_deny) {
                dlgMsg += "<td>" + com_zimbra_delegatedadmin.Col_deny + ": " + "</td>";
                dlgMsg += "<td>" +( grant[key] && grant[key] == "1" ? ZaMsg.Yes : ZaMsg.No )+ "</td>" ;
            }
            dlgMsg += "</tr>";
        }
    }
    dlgMsg += "</table>";
    
    return dlgMsg ;
}


ZaTargetPermission.findIndexOfGrant = function (grantList, grant) {
    var index = -1 ;
    for (var i=0; i  < grantList.length; i ++) {
        var keys = [ZaGrant.A_grantee, ZaGrant.A_grantee_type, ZaGrant.A_deny, ZaGrant.A_right, ZaGrant.A_right_type] ;
        var found = true ;
        for (var j =0; i < keys.length; j ++) {
            var key = keys[j] ;
            if (grant[key] != grantList[key]) {
               found = false ;
               break ;
            }
        }

        if (found) {
            index = i ;
            break ;
        }
    }

    return index ;
}


ZaItemRightList = function (contructor) {
    ZaItemList.call (this, contructor) ;
}

ZaItemRightList.prototype = new ZaItemList ;
ZaItemRightList.prototype.constructor = ZaItemRightList ;

ZaItemRightList.prototype.toString =
function() {
	return "ZaItemRightList";
}

ZaItemRightList.prototype.loadFromJS =
function (resp) {
    if(!resp || !resp.right)
		return;

    for (i = 0; i < resp.right.length; i ++) {
        var item;
        if(this._constructor) {
            item = new this._constructor() ;
        }
        item.type = ZaItem.RIGHT ;
        item.initFromJS(resp.right[i]) ;
        this.add (item) ;
    }
    /*
    for(var ix in resp) {
		if(resp[ix] instanceof Array) {
			var arr = resp[ix];
			var len = arr.length;
			for(var i = 0; i < len; i++) {
				var item;
				if(this._constructor) {
					item = new this._constructor();
				} else {
					item = ZaItem.getFromType(ix);
				}
				item.type = ix;
				item.initFromJS(arr[i]);

				//special cases
				if (item instanceof ZaDomain && item.attrs[ZaDomain.A_domainType] == "alias"){
					continue ;
				}
				if (item instanceof ZaAlias) {
					item.attrs[ZaAlias.A_targetType] = arr[i][ZaAlias.A_targetType] ;
					item.attrs[ZaAlias.A_targetAccount] = arr[i][ZaAlias.A_targetAccount] ;
				}

				if(this._idHash[item.id]) {
					this._idHash[item.id].initFromJS(arr[i]);
				} else {
					this.add(item);
				}
			}
		}
	}  */
}








