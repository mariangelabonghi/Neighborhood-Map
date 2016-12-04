//The list of the locations in my map
var locationList = [
    { position: {lat: 41.0503, lng: 16.1617}, name: "Castel del Monte, Apulia"},
    { position: {lat: 41.1303, lng: 16.8701}, name: "Basilica di San Nicola"},
    { position: {lat: 40.7167, lng: 17.3333}, name: "Itria Valley"},
    { position: {lat: 41.7330, lng: 15.7500}, name: "Gargano"},
    { position: {lat: 40.3517, lng: 18.1694}, name: "Lecce Cathedral"},
    { position: {lat: 41.4227, lng: 15.57172}, name: "Sanctuary of Monte Sant'Angelo"},
    { position: {lat: 41.2822, lng: 16.4184}, name: "Trani Cathedral"},
    { position: {lat: 40.8325, lng: 17.3408}, name: "Zoo Safari Fasanolandia"},
    { position: {lat: 41.3611, lng: 15.3085}, name: "Troia Cathedral"},
    { position: {lat: 41.7069, lng: 15.7032}, name: "Padre Pio Pilgrimage Church"},
    { position: {lat: 41.1063, lng: 16.6898}, name: "Bitonto Cathedral"},
    { position: {lat: 41.5091, lng: 15.3215}, name: "Lucera Castle"}
];


//Here what I need to load the map in the div #map
var map;
var wikiURL ='https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';
var crrInfoWindow;

//Initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.976667, lng: 16.75},
    zoom: 9
});
//applied binding here to avoid error "Google is not defined"...
    ko.applyBindings(viewModel());
}


//Here starts the ViewModel!
function viewModel() {

    var self = this;
    //My locations in an observable array
    self.locationList = ko.observableArray(locationList);
    //Instantiate marker
    self.locationList().forEach(function(loc) {
        var marker = new google.maps.Marker({
            position: loc.position,
            map: map,
            title: loc.name,
            animation: google.maps.Animation.DROP
        });

        loc.marker = marker;
        marker.setVisible(true);
        self.markers = [];
        self.markers.push(marker);
        self.markers = ko.observableArray([]);
        //Use Ajax to retrieve wiki info
            $.ajax({
                    url: wikiURL+loc.name,
                    dataType: 'jsonp',
                    timeout: 1000
                    }).done(function(locationList) {
                        //here the content of the information window with wiki info
                        var contentString = '<h3>' + loc.name + '</h3>'+'<p>' + locationList[2][0] +'<a href=' + locationList[3][0] + ' target="blank"> Wikipedia</a></p>';
                        var infoWindow = new google.maps.InfoWindow({
                                        content: contentString
                                });
                        loc.infoWindow = infoWindow;
                        //animation and window when click the marker
                        loc.marker.addListener('click', function () {
                                        if (crrInfoWindow !== undefined) {
                                                crrInfoWindow.close();
                                        }
                                        crrInfoWindow = loc.infoWindow;
                                        loc.infoWindow.open(map, this);
                                        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
                                        setTimeout(function () {
                                                loc.marker.setAnimation(null);
                                        }, 1000);
                                });
                        }).fail(function(jqXHR, textStatus){
                        alert("ops failed to get wikipedia resources");
                    });
    });
    //animation and window on the marker when click the name on the list location
    self.clickLocation = function(loc) {
        if (loc.name) {
            loc.marker.setAnimation(google.maps.Animation.BOUNCE);
             if (crrInfoWindow !== undefined) {
                crrInfoWindow.close();
            }
            crrInfoWindow = loc.infoWindow;
            crrInfoWindow.open(map, loc.marker);
        }
        setTimeout(function() {
            loc.marker.setAnimation(null);
        }, 1000);
    };

    self.filterText = ko.observable('');
    //animation for markers
    function toggleBounce(marker) {
        if (marker.setAnimation() != null) {
            marker.setAnimation(null);
        } else
        {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
            marker.setAnimation(null);
            }, 600);
        }
    }
    //use arrayFilter of knockout to filter location and markers
    self.filteredLocation = ko.computed(function() {
        return ko.utils.arrayFilter(self.locationList(), function(item) {
          if (item.name.toLowerCase().indexOf(self.filterText().toLowerCase()) !== -1) {
            if(item.marker)
              item.marker.setMap(map);
          } else {
            if(item.marker)
              item.marker.setMap(null);
          }
          return item.name.toLowerCase().indexOf(self.filterText().toLowerCase()) !== -1;
        });
      }, self);
}

//show menu when click the button menu for small devices
$(".button-menu").click(function() {
$("#mainmenu").toggleClass("show");
});