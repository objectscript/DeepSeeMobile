define([], function(){
    return function(d){
        var id = d.id;
        console.log(id);
        var servers;
        if (localStorage.servers) servers = JSON.parse(localStorage.servers);
        if (!servers) servers = [];


        if (id != undefined) {
            //edit mode, fill fields
            if (servers[id]) {
                $("#txtIP").val(servers[id].ip);
                $("#txtNamespace").val(servers[id].namespace);
                $("#txtUser").val(servers[id].user);
                $("#txtPassword").val(servers[id].password);
            }
        }

        $("#btnBack").off('tap').on('tap', function() {
            App.m.publish("viewchange:ServerList", { holder: "#loginScreen" });
        });

        // Add or edit server. if id presented - edit mode
        $("#btnSave").off('tap').on('tap', function() {
            var ip = $("#txtIP").val();
            var namespace = $("#txtNamespace").val();
            var user = $("#txtUser").val();
            var password = $("#txtPassword").val();

            if (ip == "") {
                alert("Please fill server field");
                return;
            }
            if (ip.substr(ip.length-1, 1) == "/") ip = ip.substr(0, ip.length - 1);

            if (id != undefined) {
                if (servers[id]) servers[id] = {ip: ip, namespace: namespace, user: user, password: password};
            } else servers.push({ip: ip, namespace: namespace, user: user, password: password});
            localStorage.servers = JSON.stringify(servers);

            App.m.publish("viewchange:ServerList", { holder: "#loginScreen" });

        });
    };
});
