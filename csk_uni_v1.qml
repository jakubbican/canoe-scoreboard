import QtQuick 2.12
import QtQuick.Dialogs 1.2
import QtQuick.Window 2.12
import QtQuick.Layouts 1.12
import QtQuick.Controls 2.12
import QtQuick.Controls.Material 2.12
import QtWebSockets 1.0
import Qt.labs.settings 1.0

import com.stiming.canoedisplay 1.0

ApplicationWindow {
    id: root
    visible: true
    flags: Qt.Window
    visibility: ApplicationWindow.Windowed
    width: 1000
    height: 860
    title: qsTr("%1 (%2)").arg(Qt.application.name).arg(Qt.application.version)
    Material.theme: Material.Dark
    Material.accent: Material.Blue
    font.family: "Consolas"
    font.pointSize: 12

    property string defVal_c123host: "127.0.0.1"
    property int defVal_TVoddPort: 8001
    property int defVal_TVevenPort: 8002
    property string defVal_EventFilePath: ""
    property string defVal_eventName: "Event Name"
    property int defVal_holdfinishtime: 10
    property int defVal_resultsPageDelay: 10
    property int defVal_resultsPages: 20
    property int defVal_resultsBibHltDelay: 30
    property int defVal_debugDay: -1

    Settings {
        id: settings
        property alias x: root.x
        property alias y: root.y
        property alias width: root.width
        property alias height: root.height
        property alias eventName: tfTitle.text
        property alias infoText: tfInfoText.text

        property alias c123address: cDisp.host
        property alias portTVodd: cDisp.portTVodd
        property alias portTVeven: cDisp.portTVeven
        property alias eventFilename: cDisp.eventFilename
        property alias timeHoldFinish: cDisp.holdFinishTime
        property alias resultsPageDelay: cDisp.resPageDelay
        property alias resultsPages: cDisp.resDispTop
        property alias resultsBibHltDelay: cDisp.resBibHighlightDelay

        property alias debugDay: cDisp.debugDay
    }

    Dialog {
        id:dialogSettings
        title: "Settings"
        modal: true
        width: 600
        standardButtons: Dialog.Ok | Dialog.Cancel | Dialog.RestoreDefaults

        FileDialog {
            id: fileDialog
            title: "Please choose Canoe Event file"
            selectMultiple: false
            nameFilters: ["Canoe Event files (*.xml)"]
            folder: shortcuts.documents
            onAccepted: idS_EventFilePath.text = fileDialog.fileUrl
            //onRejected: console.log("Canceled")
        }

        GridLayout {
            anchors.fill: parent
            Layout.fillWidth: true
            columns: 2

            Label { text: "C123 address:" }
            TextField {
                id: idS_host
                placeholderText: qsTr("IP address")
                Layout.alignment: Qt.AlignRight
                ToolTip.visible: hovered
                ToolTip.text: qsTr("IP adresa pocitaca, kde bezi aplikacia Canoe123.")
            }

            Label { text: "TVodd port:" }
            TextField {
                id: idS_TVoddPort
                placeholderText: qsTr("TCP port")
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("TCP port servera na ktorom bezi rozhranie RunningTV pre ODD.")
            }

            Label { text: "TVeven port:" }
            TextField {
                id: idS_TVevenPort
                placeholderText: qsTr("TCP port")
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("TCP port servera na ktorom bezi rozhranie RunningTV pre EVEN.")
            }

            Label { text: "Even File Path:" }
            TextField {
                id: idS_EventFilePath
                placeholderText: qsTr("file")
                Layout.fillWidth: true

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Cesta k Canoe123 Event suboru.")

                onPressed: fileDialog.visible = true
            }

            ToolSeparator {
                Layout.columnSpan: 2
                Layout.fillWidth: true
                orientation : Qt.Horizontal
            }

            Label { text: qsTr("HoldFinishTime (s):") }
            SpinBox {
                id: idS_holdtime; from: 1; to: 30; stepSize: 1; value: 1;
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Pocet sekund, kolko ostane svietit pretekarov vysledok po prechode cielom.")
            }

            Label { text: qsTr("ResultsCount:") }
            SpinBox {
                id: idS_resPages; from: 0; to: 30; stepSize: 5; value: 20;
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Pocet vysledkov, ktore sa budu v malych vysledkoch rotovat.\n0 - bez obmedzenia")
            }

            Label { text: qsTr("ResultsPageDelay (s):") }
            SpinBox {
                id: idS_resPageDelay; from: 1; to: 20; stepSize: 1; value: 10;
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Cas, po ktorom sa zobrazi dalsia strana malych vysledkov.")
            }

            Label {
                text: qsTr("ResultsBibHltDelay (s):")
            }
            SpinBox {
                id: idS_resBibHltDelay; from: 0; to: 60; stepSize: 1; value: 30;
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Po prichode bibu do ciela, dojde k jeho zvyrazneniu v malych vysledkoch.\n0 - deaktivacia tejto funkcie")
            }

            ToolSeparator {
                Layout.columnSpan: 2
                Layout.fillWidth: true
                orientation : Qt.Horizontal
            }

            Label {
                text: qsTr("Debug day:")
            }
            SpinBox {
                id: idS_dbgDay; from: -1; to: 31; stepSize: 1; value: 1;
                Layout.alignment: Qt.AlignRight

                ToolTip.visible: hovered
                ToolTip.text: qsTr("Aktualny den s ktorym ma aplikacia pracovat, z dovodu CanoeReplay.\n-1 - funkcia deaktivovana")
            }


        }

        onAboutToShow: {
            // pred otvorenim dialogu, si naplnime aktualne hodnoty
            idS_host.text = cDisp.host
            idS_TVoddPort.text = cDisp.portTVodd
            idS_TVevenPort.text = cDisp.portTVeven
            idS_EventFilePath.text = cDisp.eventFilename
            idS_holdtime.value = cDisp.holdFinishTime
            idS_resPages.value = cDisp.resDispTop
            idS_resPageDelay.value = cDisp.resPageDelay
            idS_resBibHltDelay.value = cDisp.resBibHighlightDelay
            idS_dbgDay.value = cDisp.debugDay

        }
        onAccepted: {
            cDisp.host = idS_host.text
            cDisp.portTVodd = parseInt(idS_TVoddPort.text, 10)
            cDisp.portTVeven = parseInt(idS_TVevenPort.text, 10)
            cDisp.eventFilename = idS_EventFilePath.text
            cDisp.holdFinishTime = idS_holdtime.value
            cDisp.resDispTop = idS_resPages.value
            cDisp.resPageDelay = idS_resPageDelay.value
            cDisp.resBibHighlightDelay = idS_resBibHltDelay.value
            cDisp.debugDay = idS_dbgDay.value
        }
        onReset: {
            idS_host.text = defVal_c123host
            idS_TVoddPort.text = defVal_TVoddPort
            idS_TVevenPort.text = defVal_TVevenPort
            idS_EventFilePath.text = defVal_EventFilePath
            idS_holdtime.value = defVal_holdfinishtime
            idS_resPages.value = defVal_resultsPages
            idS_resPageDelay.value = defVal_resultsPageDelay
            idS_resBibHltDelay.value = defVal_resultsBibHltDelay
            idS_dbgDay.value = defVal_debugDay
        }

    }

    // vsetci aktualne pripojeny ws klienti
    property variant wsClients: []

    ListModel { id: scheduleModel }

    function sendMessageToAll( msg ) {
        for( var i=0; i< wsClients.length; i++ ) {
                wsClients[i].sendTextMessage( msg );
        }
    }

    function sendControlMsg() {
        var controlMsg = {
            displayCurrent  : swDispCurrent.checked  ? "1":"0",
            displayTop      : swDispTop.checked      ? "1":"0",
            displayTop10    : swDispTop10.checked    ? "1":"0",
            displayInfoText : swDispInfoText.checked ? "1":"0",
            displaySchedule : swDispSchedule.checked ? "1":"0",
            displayDayTime  : swDispDayTime.checked  ? "1":"0",
            displayTitle    : swDispTitle.checked    ? "1":"0",
            displayTopBar   : swDispTopBar.checked   ? "1":"0",
            displayFooter   : swDispFooter.checked   ? "1":"0",
            displayOnCourse : swDispCourse.checked   ? "1":"0",
            displayOnStart  : swDispOnStart.checked  ? "1":"0"
        }
        var message = { msg: "control", data: controlMsg }
        //console.log( JSON.stringify( message ) );
        sendMessageToAll( JSON.stringify(message) );
    }

    function sendDayTimeMsg() {
        // neposielaj data ak nezobrazujeme
        if ( !swDispDayTime.checked ) return;

        var dayTimeMsg = {
            time: cDisp.timeString
        }
        var message = { msg: "daytime", data: dayTimeMsg }
        //console.log( JSON.stringify( message ) );
        sendMessageToAll( JSON.stringify(message) );
    }

    function sendInfoTextMsg() {
        var infoTextMsg = {
            text: tfInfoText.text
        }
        var message = { msg: "infotext", data: infoTextMsg }
        //console.log( JSON.stringify( message ) );
        sendMessageToAll( JSON.stringify(message) );
    }

    function sendTitleMsg() {
        var titleMsg = {
            text: tfTitle.text
        }
        var message = { msg: "title", data: titleMsg }
        //console.log( JSON.stringify( message ) );
        sendMessageToAll( JSON.stringify(message) );
    }

    function sendCompetitor() {
        var compMsg = {
            Bib: cDisp.dispCompetitor["Bib"],
            Name: cDisp.dispCompetitor["Name"],
            Nat: cDisp.dispCompetitor["Nat"],
            Pen: cDisp.dispCompetitor["Pen"],
            Gates: cDisp.dispCompetitor["Gates"],
            Total: cDisp.dispCompetitor["Total"],
            TTBDiff: cDisp.dispCompetitor["TTBDiff"],
            TTBName: cDisp.dispCompetitor["TTBName"],
            Rank: cDisp.dispCompetitor["Rank"]
        }

        var message = { msg: "comp", data: compMsg }
        //console.log( JSON.stringify( message ) );
        sendMessageToAll( JSON.stringify(message) );
    }

    WebSocketServer {
        id: server
        port: 8081
        host: "0.0.0.0"
        listen: true
        onClientConnected: {
            webSocket.onStatusChanged.connect(function(status) {
                // co sa ma spravit, ak klient zmeni svoj Status - vymazeme ho zo zoznamu aktivnych klientov
                //console.log(qsTr("Client status changed to %1").arg(status));
                for(var i = 0; i < wsClients.length; i++ ) {
                    if ( webSocket === wsClients[i] ) {
                        console.log(qsTr("Client removed %1").arg( webSocket ));
                        wsClients.splice(i,1);
                        break;
                    }
                }
                labWSclientsV.text = wsClients.length;
            });

            // pridajme si klienta do naseho zoznamu
            wsClients.push( webSocket );
            console.log( qsTr("Client connected %1 from %2").arg( webSocket ).arg( webSocket.url ) );

            labWSclientsV.text = wsClients.length;

            // po pripojeni klienta mu treba poslat nejake spravy
            sendInfoTextMsg();
            sendTitleMsg();
            sendControlMsg();
        }
        onErrorStringChanged: {
            console.log(qsTr("WebSocketServer error: %1").arg(errorString))
        }
    }

//######################## ZACIATOK HLAVNEHO OKNA #############################
//######################## ZACIATOK HLAVNEHO OKNA #############################
//######################## ZACIATOK HLAVNEHO OKNA #############################

    Button {
        id: btnSettings
        text: "Settings"
        width: parent.width

        onReleased: dialogSettings.open()
    }

    // lava polovica okna
    GridLayout {
        id: gridLayoutLeft
        width: root.contentItem.width/2-10
        anchors.left: parent.left
        anchors.leftMargin: 5
        anchors.rightMargin: 5
        anchors.top: btnSettings.bottom
        rowSpacing: 2
        layoutDirection: Qt.LeftToRight
        flow: GridLayout.LeftToRight
        layer.smooth: false
        layer.enabled: false
        columns: 2

        // WebSocket server clients
        Label {
            id: labWSclients
            text: qsTr("WebSocket clients:")
        }
        Label {
            id: labWSclientsV
            text: "na"
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }
        // Adresa hosta c123
        Label {
            id: labCanoe123Host
            text: qsTr("Canoe123 host:")
        }
        Label {
            id: labCanoe123HostV
            text: cDisp.host
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }
        // zobrazenie aktualneho dna, pouziva sa na filtrovanie dnesnych raceov
        Label {
            id: labDay
            text: qsTr("Current Day:")
        }

        Label {
            id: labDayV
            text: cDisp.currDay
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
            background: Rectangle {
                color: (cDisp.currDay == new Date().getDate()) ? "green" : "red"
            }

        }

        Row {
            Layout.fillWidth: true
            Layout.columnSpan: 2
            height: 20
            spacing: 10
            Label {
                id: labConTerminal
                text: "TERMINAL"
                property string toolTipText: "No info"
                background: Rectangle { id: bgConTerminal; color: "yellow"}
                ToolTip.text: toolTipText
                ToolTip.visible: toolTipText ? maConTerminal.containsMouse : false
                MouseArea { id: maConTerminal; anchors.fill: parent; hoverEnabled: true }
            }
            Label {
                id: labConOdd;
                text: "TV - ODD";
                property string toolTipText: "No info"
                background: Rectangle { id: bgConOdd; color: "yellow"}
                ToolTip.text: toolTipText
                ToolTip.visible: toolTipText ? maConOdd.containsMouse : false
                MouseArea { id: maConOdd; anchors.fill: parent; hoverEnabled: true }
            }
            Label {
                id: labConEven;
                text: "TV - EVEN";
                property string toolTipText: "No info"
                background: Rectangle { id: bgConEven; color: "yellow"}
                ToolTip.text: toolTipText
                ToolTip.visible: toolTipText ? maConEven.containsMouse : false
                MouseArea { id: maConEven; anchors.fill: parent; hoverEnabled: true }
            }
            Label {
                id: labConFile;
                text: "EVENT FILE";
                property string toolTipText: "No info"
                background: Rectangle { id: bgConFile; color: "yellow"}
                ToolTip.text: toolTipText
                ToolTip.visible: toolTipText ? maConFile.containsMouse : false
                MouseArea { id: maConFile; anchors.fill: parent; hoverEnabled: true }
            }
        }

        Switch {
            id: swDispTitle
            text: qsTr("DisplayTitle")
            onPositionChanged: sendControlMsg();
        }

        Switch {
            id: swDispTopBar
            text: qsTr("DisplayTopBar")
            onPositionChanged: sendControlMsg();
        }

        TextField {
            id: tfTitle
            text: defVal_eventName
            Layout.preferredWidth: gridLayoutRight.width*.95
            Layout.maximumWidth: gridLayoutRight.width
            placeholderText: "Event Title here"
            wrapMode: Text.WordWrap
            selectByMouse: true
            Layout.columnSpan: 2
            font.pixelSize: 20

            onEditingFinished: sendTitleMsg();
        }

        Switch {
            id: swDispInfoText
            text: qsTr("DisplayInfoText")
            Layout.columnSpan: 2

            onPositionChanged: sendControlMsg();
        }

        TextField {
            id: tfInfoText
            text: ""
            Layout.preferredWidth: gridLayoutRight.width*.95
            Layout.maximumWidth: gridLayoutRight.width
            placeholderText: "Info text here"
            wrapMode: Text.WordWrap
            selectByMouse: true
            Layout.columnSpan: 2
            font.pixelSize: 20

            onEditingFinished: sendInfoTextMsg();
        }

        // zaciatok DayTime
        Switch {
            id: swDispDayTime
            text: qsTr("DisplayDayTime")
            Layout.columnSpan: 2
            
            onPositionChanged: sendControlMsg();
        }
        Label {
            id: labCanoeTime
            text: qsTr("Canoe123 time:")
        }
        Label {
            id: labCanoeTimeV
            text: cDisp.timeString
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }
        // koniec DayTime

        // zacatek Display Footer
        Switch {
            id: swDispFooter
            text: qsTr("DisplayFooter")
            onPositionChanged: sendControlMsg();
        }
        Label {
            text: "Footer"
        }
        // koniec DisplayFooter
        
        // zaciatok StartList
        Switch {
            id: swDispOnStart
            text: qsTr("DisplayOnStart")
            Layout.columnSpan: 2

            onPositionChanged: sendControlMsg();
        }
        Label {
            text: "StartList count:"
        }
        Label {
            id: labStartListCountV
            text: "na"
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
            property string toolTipText: ""

            ToolTip.text: toolTipText
            ToolTip.visible: toolTipText ? maStartListCountV.containsMouse : false
            MouseArea { id: maStartListCountV; anchors.fill: parent; hoverEnabled: true }
        }
        // koniec StartList

        // zaciatok Course
        Switch {
            id: swDispCourse
            text: qsTr("DisplayCourse")
            Layout.columnSpan: 2

            onPositionChanged: sendControlMsg();
        }
        Label {
            id: labCourse
            text: qsTr("Count:")
        }
        Label {
            id: labCourseV
            text: cDisp.getOnCourseCount()
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }
        ListView {
            id: lvOnCourse
            Layout.columnSpan: 2
            Layout.fillWidth: true
            height: 60
            spacing: 10

            orientation: Qt.Horizontal
            //layoutDirection: Qt.LeftToRight
            layoutDirection: Qt.RightToLeft

            model: oncourseModel

            delegate: Item {
                width: 60
                height: 60

                MouseArea {
                    anchors.fill: parent
                    onDoubleClicked: {
                        cDisp.setDispCompetitorManual( oncourseModel.get( index ).BibKey )
                    }
                }

                Rectangle {
                    anchors.fill: parent
                    radius: 10
                    color: (Bib === cDisp.dispCompetitor["Bib"]) ? "lightgreen" : "lightgray"
                    Column {
                        Text { text: Bib ? Bib : ""; width: 60; horizontalAlignment: Text.AlignHCenter; font.pointSize: 20; font.bold: true }
                        Text { text: Time ? Time : ""; width: 60; horizontalAlignment: Text.AlignRight; font.pointSize: 10; }
                    }
                }
            }
        }

        ListModel {
             id: oncourseModel
        }
        // koniec Course

        Switch {
            id: swDispCurrent
            text: qsTr("DisplayCurrent")
            Layout.columnSpan: 2

            onPositionChanged: sendControlMsg();
        }
        // zaciatok poloziek Current Competitor
        Label {
            id: labBib
            text: qsTr("Bib")
        }

        Label {
            id: labBibV
            text: cDisp.dispCompetitor["Bib"] ? cDisp.dispCompetitor["Bib"] : "na"
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            id: labName
            text: qsTr("Name")
        }

        Label {
            id: labNameV
            text: cDisp.dispCompetitor["Name"] ? cDisp.dispCompetitor["Name"] : "na"
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            id: labClubAndNat
            text: qsTr("Club / Nat")
        }

        Label {
            id: labClubAndNatV

            text: (cDisp.dispCompetitor["Club"] ? cDisp.dispCompetitor["Club"] : "na") + " / " + (cDisp.dispCompetitor["Nat"] ? cDisp.dispCompetitor["Nat"] : "na")
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            text: qsTr("Race / RaceId")
        }

        Label {
            id: labRaceV
            text: (cDisp.dispCompetitor["Race"] ? cDisp.dispCompetitor["Race"] : "na") + " / " + (cDisp.dispCompetitor["RaceId"] ? cDisp.dispCompetitor["RaceId"] : "na")
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            id: labGates
            text: qsTr("Gates")
        }
        Label {
            id: labGatesV
            text: cDisp.dispCompetitor["Gates"] ? cDisp.dispCompetitor["Gates"] : "na"
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }

        Label {
            text: qsTr("Pen / Time / Total")
        }
        Label {
            id: labPenV
            text: (cDisp.dispCompetitor["Pen"] ? cDisp.dispCompetitor["Pen"] : "na" ) + " / " +
                  (cDisp.dispCompetitor["Time"] ? cDisp.dispCompetitor["Time"] : "na") + " / " +
                  (cDisp.dispCompetitor["Total"] ? cDisp.dispCompetitor["Total"] : "na")
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            text: qsTr("TTBName / TTBDiff")
        }
        Label {
            id: labTTBDiffV
            text: (cDisp.dispCompetitor["TTBName"] ? cDisp.dispCompetitor["TTBName"] : "na") + " / " +
                (cDisp.dispCompetitor["TTBDiff"] ? cDisp.dispCompetitor["TTBDiff"] : "na")
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
        }

        Label {
            id: labRank
            text: qsTr("Rank")
        }

        Label {
            id: labRankV
            text: cDisp.dispCompetitor["Rank"] ? cDisp.dispCompetitor["Rank"] : "na"
            horizontalAlignment: Text.AlignRight
            Layout.fillWidth: true
            font.bold: true
        }
        // koniec poloziek Current Competitor

    }

    // prava polovica okna
    GridLayout {
        id: gridLayoutRight
        width: root.contentItem.width/2-10
        anchors.right: parent.right
        anchors.leftMargin: 5
        anchors.rightMargin: 5
        anchors.top: btnSettings.bottom
        rowSpacing: 2
        layoutDirection: Qt.LeftToRight
        flow: GridLayout.LeftToRight
        layer.smooth: false
        layer.enabled: false
        columns: 2

        Switch {
            id: swDispSchedule
            text: qsTr("DisplaySchedule")
            Layout.columnSpan: 2
            checked: false

            onPositionChanged: {
                // zoznam aktualizujem len pred zapnutim, aby sa nezmenil pri vypnuti
                if ( checked ) cDisp.sendScheduleMsg();
                sendControlMsg();
            }
        }

        Label {
            id: labscheduleCount
            text: qsTr("Schedule Count")
        }

        Label {
            id: labscheduleCountV
            text: "na"
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

        Label {
            id: labresultsCount
            text: qsTr("Results Count")
        }

        Label {
            id: labresultsCountV
            text: "na"
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

        ListView {
            id: lvSchedule
            Layout.columnSpan: 2
            Layout.fillWidth: true

            clip: true
            height: 200
            spacing: 5

            activeFocusOnTab: true
            keyNavigationWraps: true
            highlight: Rectangle { z: 2; border.color: "blue"; border.width: 2; color: "transparent"}
            highlightMoveDuration: 100
            highlightMoveVelocity: -1

            ScrollBar.vertical: ScrollBar { }

            model: scheduleModel

            delegate: Item {
                width: scheduleRow.width
                height: 25
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        lvSchedule.currentIndex = index
                        lvSchedule.focus = true
                    }
                    onDoubleClicked: {
                        // nastavime aktualny pretek manualne
                        var _raceId = scheduleModel.get( index ).RaceId;
                        cDisp.activeRaceId = _raceId;
                    }
                }

                Rectangle {
                    anchors.fill: parent
                    color: cDisp.getMyResultColor( myResultStatus )
                    Row {
                        id: scheduleRow
                        spacing: 5
                        padding: 2
                        Text { width: 30; text: Order; horizontalAlignment: Text.AlignRight; font.pointSize: 8;  }
                        Text { width:140; text: RaceId; font.pointSize: 10; }
                        Text { width:90; text: cDisp.raceStatusString(RaceStatus); horizontalAlignment: Text.AlignRight; font.pointSize: 10;  }
                        Text { width: 50; text: myResultCount; horizontalAlignment: Text.AlignLeft; font.pointSize: 10; }
                        Text { width:260; text: Race; horizontalAlignment: Text.AlignRight; font.pointSize: 10; }
                    }
                }
            }

            headerPositioning: ListView.OverlayHeader
            header: Rectangle {
                border.color: "black"
                border.width: 1
                color: "white"
                height: 15
                width: headerRow.width
                z: 2
                Row {
                    id: headerRow
                    spacing: 5
                    padding: 2
                    Text { width: 30; text: "Order"; horizontalAlignment: Text.AlignRight; font.family: "Consolas"; font.pointSize: 8;  }
                    Text { width:140; text: "RaceId"; font.family: "Consolas"; font.pointSize: 8; }
                    Text { width:90; text: "Status"; horizontalAlignment: Text.AlignRight; font.family: "Consolas"; font.pointSize: 8;  }
                    Text { width: 50; text: "Count"; horizontalAlignment: Text.AlignRight; font.family: "Consolas"; font.pointSize: 8;  }
                    Text { width:260; text: "Race"; horizontalAlignment: Text.AlignRight; }
                }
            }

        }

        Button {
            id: btActiveRaceId
            text: qsTr("ActiveRaceId")
            ToolTip.text: "Nastavi Schedule list na ActiveRaceId"
            ToolTip.visible: hovered

            onClicked: {
                if ( cDisp.activeRaceId ) {
                    var i;
                    for (i = 0; i < scheduleModel.count; ++i) {
                        if (scheduleModel.get(i).RaceId === cDisp.activeRaceId) break;
                    }
                    lvSchedule.currentIndex = i
                    lvSchedule.positionViewAtIndex(i, ListView.Center)
                }
            }
        }

        Label {
            id: labactiveRaceIdV
            text: cDisp.activeRaceId ? cDisp.activeRaceId : "na"
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

        Label {
            id: labActiveResultsCount
            text: qsTr("ActiveResultsCount")
        }

        Label {
            id: labActiveResultsCountV
            text: qsTr("na")
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

        Switch {
            id: swDispTop10
            text: qsTr("DisplayTop10")
            Layout.columnSpan: 2
            checked: false

            onPositionChanged: {
                if ( checked ) {

                    // vazba s elementom Top
                    if ( swDispTop.checked ) swDispTop.checked = false;

                    cDisp.sendTop10Msg();
                    top10timer.start();
                } else {
                    top10timer.stop();
                }
                sendControlMsg();
            }
        }

        Switch {
            id: swDispTop
            text: qsTr("DisplayTop")
            Layout.columnSpan: 2
            checked: false

            onPositionChanged: {
                if ( checked ) {
                    // vazba s elementom Top10
                    if ( swDispTop10.checked ) swDispTop10.checked = false;
                }
                cDisp.resDispFrom = 0;
                sendControlMsg();
            }
        }

        Label {
            id: labDispFrom
            text: qsTr("DispFrom")
        }

        Label {
            id: labDispFromV
            text: cDisp.resDispFrom
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

//        Label {
//            id: labResPageDelay
//            text: qsTr("ResPageDelay:")
//        }
//        Label {
//            id: labResPageDelayV
//            text: cDisp.resPageDelay
//            Layout.fillWidth: true
//            horizontalAlignment: Text.AlignRight
//            font.bold: true
//        }

//        Slider {
//            id: slResPageDelay
//            Layout.columnSpan: 2
//            Layout.fillWidth: true
//            from: 1
//            stepSize: 1
//            value: cDisp.resPageDelay
//            to: 20
//            onMoved: cDisp.resPageDelay = value;
//        }

//        Label {
//            id: labResPageCount
//            text: qsTr("ResPageCount:")
//        }
//        Label {
//            id: labResPageCountV
//            text: cDisp.resDispTop
//            Layout.fillWidth: true
//            horizontalAlignment: Text.AlignRight
//            font.bold: true
//        }

//        Slider {
//            id: slResDispTop
//            Layout.columnSpan: 2
//            Layout.fillWidth: true
//            from: 0
//            stepSize: 5
//            value: cDisp.resDispTop
//            to: 30
//            onMoved: cDisp.resDispTop = value;
//        }

        Label {
            id: cbBibHighlight
            text: qsTr("BibHighlight:")
        }

        Label {
            id: labBibHighlightV
            text: cDisp.resBibHighlight
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignRight
            font.bold: true
        }

        TextArea {
            id: taV
            height: 200
            text: ""
            placeholderText: "DisplayTop Table"
            readOnly: true
            Layout.preferredWidth: gridLayoutRight.width*.95
            Layout.columnSpan: 2
            Layout.rowSpan: 1
            Layout.fillHeight: false
            textFormat: Text.RichText
        }

    }

//######################## KONIEC HLAVNEHO OKNA #############################
//######################## KONIEC HLAVNEHO OKNA #############################
//######################## KONIEC HLAVNEHO OKNA #############################

    Timer {
        id: dispTimer
        interval: cDisp.resPageDelay*1000
        running: false; repeat: false

        onTriggered: {
            // pripravi novu stranku a zobrazi ju
            var resCount = cDisp.getActiveResultsCount();
            // nemame koho zobrazit
            if ( resCount === 0 ) {
                restart();
                cDisp.resDispFrom = 0;
                //console.log("Restartujem timer!!!");
                return;
            }
            if ( (cDisp.resDispFrom + cDisp.resLines) >= resCount ) {
                // dosli sme na koniec zoznamu
                cDisp.resDispFrom = 0;
            } else if ( (cDisp.resDispTop>0)&&((cDisp.resDispFrom + cDisp.resLines) >= cDisp.resDispTop) ) {
                // ak je nastavene Top obmedzenie, tak ho aplikujeme
                // dosli sme na obmedzenie zobrazenia resScroll
                cDisp.resDispFrom = 0;
            } else {
                cDisp.resDispFrom += cDisp.resLines;
            }
            // a zavolame prekreslenie
            cDisp.displayCompetitors()
        }
    }

    // timer na aktualizaciu elementu top10
    Timer {
        id: top10timer
        interval: 1000
        running: false
        repeat: true

        onTriggered: {
            cDisp.sendTop10Msg();
        }
    }

    // timer, ktory po urcitom case zresetuje bib ktory sa ma highlightovat vo vysledkoch
    Timer {
        id: bibHighlightReset
        interval: 1000*40
        running: false
        repeat: false

        onTriggered: cDisp.resBibHighlight = 0;
    }

    CanoeDisplay {
        id: cDisp
        host: defVal_c123host
        holdFinishTime: defVal_holdfinishtime
        currDay: -1

        property int debugDay: defVal_debugDay
        property int resLines: 10000
        property int resDispTop: defVal_resultsPages
        property int resPageDelay: defVal_resultsPageDelay
        property int resDispFrom: 0
        property int resBibHighlightDelay: defVal_resultsBibHltDelay
        property int resBibHighlight: 0

        Component.onCompleted: {
            console.log("cDisp completed!")
            cDisp.portTVodd = settings.value("portTVodd", defVal_TVoddPort)
            cDisp.portTVeven = settings.value("portTVeven", defVal_TVevenPort)
            cDisp.eventFilename = settings.value("eventFilename", defVal_EventFilePath)

            // aktivujem timer prepisovania vysledkovej tabule
            dispTimer.start()
        }

        // zobrazi stranu vysledkov na ktorej jej bib co prislo do ciela
        function displayCompetitorsWithHighlightedBib() {
            if ( cDisp.resBibHighlight == 0 ) return;
            var myCount = cDisp.getActiveResultsCount();
            if ( myCount === 0 ) return;

            // tu by som sa mal prehrabat vysledkami a najst na ktorom mieste sa nachadza resBibHighlight
            // a nastavit resDispFrom
            var foundRank;
            var notFound = true;
            for (var i = 0; i < myCount; i++) {
                var res = cDisp.getActiveResultsRank(i);
                //console.log( res["Rank"] + " - " + res["Bib"] );
                if ( parseInt(res["Bib"]) === resBibHighlight ) {
                    foundRank = parseInt(res["Rank"]);
                    notFound = false;
                    break;
                }
            }
            if ( notFound === false ) {
                // nastavime od ktorej stranky sa ma vypisat list
                var xxx = Math.trunc( (foundRank-1) / cDisp.resLines );
                resDispFrom = xxx*cDisp.resLines;
            } else {
                // nanasli sme ho vo vysledkoch, mozno nieje zapnute v C123 pocitanie Rank s nekompletnymi bodmi
                console.log("resBibHighlight not found in ActiveResults!");
            }

            // nasledne odstartovat zobrazenie displayCompetitors()
            // ci uz sme startovaciu poziciu zmenili alebo nie
            displayCompetitors();
        }

        function displayCompetitors() {
            var myCount = cDisp.getActiveResultsCount();
            if ( myCount === 0 ) return;

            var myText;
            var i;
            myText = "<table width=100% border=0 cellpadding=1 cellspacing=1>";
            myText += "<tr>";
            myText += "<th align=right>Rank</th>";
            myText += "<th align=right>Bib</th>";
            myText += "<th align=left>Name</th>";
            myText += "<th align=right>Nat</th>";
            myText += "<th align=right>myResult</th>";
            myText += "</tr>";
            var topList = [];

            for (i = cDisp.resDispFrom; i < (cDisp.resDispFrom+cDisp.resLines); i++) {
                if ( i >= myCount ) break;
                var res = {};
                res = cDisp.getActiveResultsRank(i);
                var topCompetitor = {};

                topCompetitor["Rank"] = res["Rank"];
                topCompetitor["Bib"] = res["Bib"];
                topCompetitor["Name"] = res["Name"];
                topCompetitor["FamilyName"] = res["FamilyName"];
                topCompetitor["GivenName"] = res["GivenName"];
                topCompetitor["Nat"] = res["Nat"];
                topCompetitor["Club"] = res["Club"];
                topCompetitor["Total"] = res["Total"];
                topCompetitor["Pen"] = res["Pen"];
                topCompetitor["Behind"] = res["Behind"];
                if ( i === 0 ) {
                    topCompetitor["myResult"] = res["Total"];
                    topCompetitor["Behind"] = "&nbsp;";
                    }
                else
                    topCompetitor["myResult"] = res["Total"] + " " + res["Behind"];

                if ( res["RankOrder"] === "") {
                    // asi je to startovka
                    topCompetitor["Rank"] = res["StartOrder"];
                    topCompetitor["myResult"] = res["StartTime"];
                }

                var styleColor = "";
                if ( (parseInt(res["Bib"]) === resBibHighlight)&&(resBibHighlightDelay>0) )
                    styleColor += " style=\"color:black;background-color:pink\"";

                myText += "<tr "+styleColor+">";
                myText += "<td align=right>" + topCompetitor["Rank"] + "</td>";
                myText += "<td align=right>" + topCompetitor["Bib"] + "</td>";
                myText += "<td align=left>"  + topCompetitor["Name"] + "</td>";
                myText += "<td align=right>" + topCompetitor["Nat"] + "</td>";
                myText += "<td align=right>" + topCompetitor["myResult"] + "</td>";
                myText += "</tr>";

                topList.push( topCompetitor );
            }
            myText += "</table>";
            taV.text = myText;
            // posli data ws klientom
            var topMsg = { RaceName: cDisp.getRaceNameFromRaceId(cDisp.activeRaceId),
                           RaceStatus: cDisp.getRaceStatusFromRaceId(cDisp.activeRaceId),
                           HighlightBib: resBibHighlight,
                           list: topList };
            var message = { msg: "top", data: topMsg }
            sendMessageToAll( JSON.stringify(message) )
            dispTimer.restart();
        }

        // posle Top10 data klientom
        function sendTop10Msg() {
            var compCount = 10;
            // ak mame menej pretekarov do listiny ako pozadujeme, tak dame menej
            if ( cDisp.getActiveResultsCount() < compCount ) compCount = cDisp.getActiveResultsCount();

            var top10list = [];

            for( var i = 0; i < compCount; i++ ) {
                var res = cDisp.getActiveResultsRank(i);
                top10list.push( res );
            }

            // posli data ws klientom
            var top10msg = { RaceName: cDisp.getRaceNameFromRaceId(cDisp.activeRaceId),
                           RaceStatus: cDisp.getRaceStatusFromRaceId(cDisp.activeRaceId),
                           list: top10list };
            var message = { msg: "top10", data: top10msg }
            //console.log( JSON.stringify(message) )
            sendMessageToAll( JSON.stringify(message) )
        }

        // vygeneruje data pre zobrazenie Schedule
        function sendScheduleMsg() {
            var schList = [];
            for (var i = 0; i < scheduleModel.count; i++) {
                var race = {};
                var raceStat = {};
                race = scheduleModel.get(i);
                raceStat = cDisp.getResultStartTimesByRaceId(race["RaceId"]);
                if ( (raceStat["count"]>0)&&(race["myResultStatus"]>0) ) {
                    var schRec = {};
                    schRec["Race"] = race["Race"];
                    schRec["Count"] = raceStat["count"];
                    schRec["StartFirst"] = raceStat["StartFirst"];
                    schRec["StartLast"] = raceStat["StartLast"];
                    schRec["Past"] = raceStat["past"];
                    schList.push( schRec );
                }
            }
            // posli data ws klientom
            var message = { msg: "schedule", data: schList };
            sendMessageToAll( JSON.stringify(message) );
            //console.log( JSON.stringify( message ) );
        }

        // posli pretekarov na trati
        function sendOnCourseMsg() {

            var courseList = [];
            var courseCount = cDisp.getOnCourseCount();

            var diff = courseCount - oncourseModel.count;
            if ( diff > 0 ) {
                // treba pridat riadky
                for(var r=0;r<diff;r++) oncourseModel.append({})
            }
            if ( diff < 0 ) {
                // treba zmazat riadky
                oncourseModel.remove( 0, Math.abs(diff) );
            }

            // otacam poradie aby posledny riadok predstavoval ciel
            for (var i=courseCount; i>0; i--) {
                var comp = cDisp.getOnCourseIndex(i-1);
                courseList.push( comp );
                // nastav model
                //oncourseModel.set(courseCount-i, comp );
                oncourseModel.set(i-1, comp );
            }

            // posli data ws klientom
            var message = { msg: "oncourse", data: courseList };
            sendMessageToAll( JSON.stringify(message) );
            //console.log( JSON.stringify( message ) );
        }

        // prisla aktualizacia ListuResults
        function updateResults() {
            // prebehne vsetky polozky a zaktualizuje si pocet Results
            for(var i=0;i<scheduleModel.count;i++) {
                var _raceid = scheduleModel.get(i).RaceId;
                scheduleModel.setProperty( i, "myResultCount", cDisp.getResultCountByRaceId( _raceid ) );
                scheduleModel.setProperty( i, "myResultStatus", getMyResultStatus( _raceid ) );
            }

        }

        // prisla aktualizacia ListuSchedule
        function updateSchedule() {
            var scheduleCount = cDisp.getScheduleCount();

            var i;
            for (i=0; i<scheduleCount; i++) {
                var race = cDisp.getScheduleIndex(i);
                var schedule = {};
                schedule["Order"] = race["Order"];
                schedule["RaceId"] = race["RaceId"];
                schedule["Race"] = race["Race"];
                schedule["RaceStatus"] = race["RaceStatus"];
                schedule["myResultCount"] = cDisp.getResultCountByRaceId( race["RaceId"] );
                schedule["myResultStatus"] = getMyResultStatus( race["RaceId"] );
                scheduleModel.set( i, schedule );
            }
            // toto nieje overene, ak sa zmensil ListSchedule
            if ( scheduleModel.count < i ) {
                scheduleModel.remove( i, scheduleModel.count - i );
            }

        }

        // vrati farbu pre RaceId : 0 - iny den ako dnes, 1 - dnesny pretek, 2 - aktivny pretek
        function getMyResultStatus(raceid) {
            var ret = 0;
            var raceIdArray = raceid.split("_");
            if ( parseInt(raceIdArray[2]) === cDisp.currDay ) ret = 1;
            //if ( Number(raceIdArray[2]) === cDisp.currDay ) ret = 1;
            if ( activeRaceId === raceid ) ret = 2;
            return ret;
        }

        function getMyResultColor(status) {
            switch (status) {
                case 0: return "pink";
                case 1: return "lightyellow";
                case 2: return "lightgreen";
                default: return "black";
            }
        }

        onDispCompetitorChanged: {
            sendCompetitor();
        }

        onActiveResultsChanged: {
            labActiveResultsCountV.text = cDisp.getActiveResultsCount();
            // to tu budeme musiet nechat, lebo mohlo dost k aktualizacii
            displayCompetitors();
        }

        onActiveRaceIdChanged: {
            updateResults();
            cDisp.resDispFrom = 0;
            // to tu asi netreba, lebo po prichode do ciela sa to uz vola
            // displayCompetitors();
        }

        onScheduleChanged: {
            labscheduleCountV.text = cDisp.getScheduleCount();
            updateSchedule();
        }

        onResultsChanged: {
            labresultsCountV.text = cDisp.getResultsCount();
            updateResults();
        }

        onCourseChanged: {
            labCourseV.text = cDisp.getOnCourseCount();
            sendOnCourseMsg();
        }

        onTimeStringChanged: {
            sendDayTimeMsg();
        }

        onStartListUpdated: {
            labStartListCountV.text = cDisp.getStartListCount();
        }

        onStartListShortChanged: {
            var listStartMsg = [];
            var listStart = cDisp.getStartListShort();

            var guiToolTip = "";
            for (var i=0; i<listStart.length; i++) {
                var record = JSON.parse( listStart[i] )
                guiToolTip += record.Bib + "#" + record.sts + "@" + record.StartTime + "\n"
                listStartMsg.push( record );
            }

            // vlozme si to aj do GUI
            labStartListCountV.toolTipText = guiToolTip

            // posli data ws klientom
            var message = { msg: "onstart", data: listStartMsg }
            //console.log( JSON.stringify(message) )
            sendMessageToAll( JSON.stringify(message) )
        }

        onLastBibInFinishChanged: {
            if ( resBibHighlightDelay > 0 ) {
                // ak je feature povolena, nastav HighlightBib
                bibHighlightReset.stop();
                resBibHighlight = cDisp.lastBibInFinish;
                bibHighlightReset.interval = 1000*resBibHighlightDelay;
                bibHighlightReset.start();

                displayCompetitorsWithHighlightedBib();
            }
        }

        onDebugDayChanged: {
            if ( debugDay < 0 )
                currDay = new Date().getDate()
            else
                currDay = debugDay
        }

        onCanoeComStatusChanged: {
            // nastavime farbicky
            bgConTerminal.color = (canoeComStatus["connection.Terminal.status"]) ? "green":"red"
            bgConOdd.color = (canoeComStatus["connection.TVodd.status"]) ? "green":"red"
            bgConEven.color = (canoeComStatus["connection.TVeven.status"]) ? "green":"red"
            bgConFile.color = (canoeComStatus["connection.EventFile.status"]) ? "green":"red"

            // nastavime toolTipy
            labConTerminal.toolTipText = canoeComStatus["connection.Terminal.dest"] ? canoeComStatus["connection.Terminal.dest"]:""
            labConOdd.toolTipText = canoeComStatus["connection.TVodd.dest"] ? canoeComStatus["connection.TVodd.dest"]:""
            labConEven.toolTipText = canoeComStatus["connection.TVeven.dest"] ? canoeComStatus["connection.TVeven.dest"]:""
            labConFile.toolTipText = canoeComStatus["connection.EventFile.dest"] ? canoeComStatus["connection.EventFile.dest"]:""
            //console.log( "CanoeComStatus:", JSON.stringify(canoeComStatus))
        }
    }

    Shortcut {
        sequence: "F1"
        onActivated: {
            swDispCurrent.toggle();            
        }
    }

    Shortcut {
        sequence: "F2"
        onActivated: {
            swDispCourse.toggle();
        }
    }

    Shortcut {
        sequence: "F3"
        onActivated: {
            swDispTop.toggle();
        }
    }

    Shortcut {
        sequence: "F4"
        onActivated: {
            swDispSchedule.toggle();
        }
    }
}
