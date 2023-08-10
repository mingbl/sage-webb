// The var name MUST match the name of the script file
// All applications must extend SAGE2_App
var webbViewer = SAGE2_App.extend({

    // The init function will be called during application creation
    // The signature must include the data parameter which will be passed to the parent through SAGE2Init()
    init: function(data) {

        // Create the application with a div node
        this.SAGE2Init("div", data);

        // `this.element` is created and assigned based on the above SAGE2Init.
        // In this case, this.element is a div

        // Assign the div node an id.
        // `this.id` is a unique identifier created for this instance of the app
        this.element.id = "div" + this.id;

        // Fill the element with text "Hello World"
        this.element.textContent = "This is not the James Webb Telescope Viewer";

        // Makes the app background white
        this.element.style.background = "green";
    },


});