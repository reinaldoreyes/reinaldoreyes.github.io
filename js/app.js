
document.addEventListener("DOMContentLoaded", function(){
//Efecto de desenfoque al hacer scroll


const body= document.querySelector("body");
const html= document.querySelector("html");
const container= document.querySelector(".container");
const background= document.querySelector(".background");
const backgroundContainer= document.querySelector(".background-container");

let reservationDays= 0;
let room= 0;
let nombreReserva= ""
let documentoReserva= ""
let celularReserva= ""
let correoReserva= ""
let fechaEntrada= ""
let fechaSalida= ""
let toPay= 0
let routes= {
    'home': '',
    'about': 'acerca-de',
    'reservas': 'reservas',
    'contact': 'contacto',
    'legal': 'aviso-legal',
}
let routesInverse= {
    '/': 'home',
    '/acerca-de': 'about',
    '/reservas': 'reservas',
    '/contacto': 'contact',
    '/aviso-legal': 'legal',
}
let roomPrices= {
    1: 40,
    2: 48,
    3: 65,
}

function getRandomColor() {
    const letters= '0123456789ABCDEF';
    let color= '#';
    for (let i= 0; i < 6; i++) {
        color+= letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let isScrolling= false;
let previousSection= document.querySelector(".about.section");

window.addEventListener("scroll", ()=> {
    const scrollTop= document.documentElement.scrollTop || document.body.scrollTop;
    background.style.filter= `blur(${scrollTop / 77}px)`;
    backgroundContainer.style.filter= `blur(${scrollTop / 77}px)`;

    if(document.documentElement.scrollTop > 230){
        if(document.querySelector("nav a.active")?.id=="home-link"){
            document.querySelector("nav a.active").classList.remove("active");
            document.querySelector(`nav a#${previousSection.id}-link`).classList.add("active");
            document.querySelector(".section.active")?.classList.remove("active");
            previousSection.classList.add("active");
            history.pushState({page: 1}, "", `/${routes[previousSection.id]}`);
        }
    }else{
        previousSection= document.querySelector(".section.active")?? previousSection;
        previousSection.classList.remove("active");
        document.querySelector("nav a.active").classList.remove("active");
        document.querySelector("nav a#home-link").classList.add("active");
        history.pushState({page: 1}, "", `/${routes["home"]}`);
    }
    if(document.documentElement.scrollTop == document.documentElement.scrollHeight - document.documentElement.clientHeight){
        if(!background.paused)background.pause();
    }else{
        if(background.paused)background.play();

    }
});

//Links de navegación
const links= document.querySelectorAll("nav a");
links.forEach(link=> {
    link.addEventListener("click", function(ev){
        ev.preventDefault();
        const section= document.querySelector(`#${this.id.replace("-link", "")}`);
        autoScrollHeaderTop()
        document.querySelector(".section.active")?.classList.remove("active");
        document.querySelector("nav a.active").classList.remove("active");
        this.classList.add("active")
        section?.classList.add("active");
        history.pushState({page: 1}, "", `/${routes[this.id.replace("-link", "")]}`);
        if(this.id=="home-link"){
            autoScrollHeaderBottom()
        }else{
            previousSection= section?? previousSection;
        }

        //Calendario de reservaciones

        if(section?.id== "reservas"){
            if(typeof calendar.isRendered != "undefined"){return}
            calendarEl= document.getElementById('calendar');
            calendar= new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                expandRows: true,
                locale: 'es',
                buttonText: { 
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Agenda'
                },
                selectable: true,
                selectMirror: true,
                select: function(info) {
                    let startDate= info.startStr;
                    let endDate= new Date(info.end); 
                    endDate.setDate(endDate.getDate() - 1);

                    let formattedEndDate= endDate.toISOString().split('T')[0];

                    checkIn.setDate(startDate)
                    checkOut.setDate(formattedEndDate)

                    let availableRooms= getAvailableRooms(startDate, formattedEndDate);
                    console.log("Available Rooms: ", availableRooms);

                    // Update select options
                    if(availableRooms.length=== 0) {
                        roomSelect.innerHTML= '<option value="0" disabled hidden selected>No hay habitaciones disponibles para esta fecha</option>'; // Reset
                    }else{
                        roomSelect.innerHTML= '<option value="0" disabled hidden selected>Seleccionar</option>'; // Reset
                        availableRooms.forEach(roomId=> {
                            roomSelect.innerHTML+= `<option value="${roomId}">Habitación ${roomId}</option>`;
                        });
                    }
                    total.value= "$ 0"

                    appearReservationModal();
                },
                dateClick: function(info) {
                    checkIn.setDate(info.dateStr)
                    checkOut.setDate(info.dateStr)

                    let availableRooms= getAvailableRooms(info.dateStr, info.dateStr);

                    if(availableRooms.length=== 0) {
                        roomSelect.innerHTML= '<option value="0" disabled hidden selected>No hay habitaciones disponibles para esta fecha</option>'; // Reset
                    }else{
                        roomSelect.innerHTML= '<option value="0" disabled hidden selected>Seleccionar</option>'; // Reset
                        availableRooms.forEach(roomId=> {
                            roomSelect.innerHTML+= `<option value="${roomId}">Habitación ${roomId}</option>`;
                        });
                    }

                    total.value= "$ 0"

                    appearReservationModal();
                },
                events: [
                    {
                        title: 'Habitación 1',
                        start: '2025-02-05',
                        end: '2025-02-07',
                        roomId: 1,
                    },
                    {
                        title: 'Habitación 2',
                        start: '2025-02-06',
                        end: '2025-02-08',
                        color: 'red',
                        roomId: 2,
                    },
                    {
                        title: 'Habitación 3',
                        start: '2025-02-10',
                        end: '2025-02-11',
                        color: 'blue',
                        roomId: 3,
                    },
                    {
                        title: 'Habitación 1',
                        start: '2025-02-15',
                        end: '2025-02-16',
                        color: 'green',
                        roomId: 1,
                    }
                ]
            });
            calendar.render();
            let roomSelect= document.getElementById('roomType');

            flatpickr(".date-reservation", {});
            checkIn= flatpickr("#reservationStart", {
                enableTime: false,
                dateFormat: "Y-m-d",
                locale: "es"
            });
            checkOut= flatpickr("#reservationEnd", {
                enableTime: false,
                dateFormat: "Y-m-d",
                locale: "es"
            });

            const reservationDataModal= document.querySelector(".data-reservation");
            const closeReservationDataModal= reservationDataModal.querySelector(".close");
            
            closeReservationDataModal.addEventListener("click", function(){
                reservationDataModal.classList.remove("visible");
            })

            function appearReservationDataModal(){
                reservationDataModal.classList.add("visible");
            }
            const paymentModal= document.querySelector(".pay-reservation");
            const closePaymentModal= paymentModal.querySelector(".close");


            function appearPaymentModal(price){
                paymentModal.classList.add("visible");

                document.getElementById("paypal-button-container").innerHTML = "";
                paypal.Buttons({
                    createOrder: function(data, actions) {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    currency_code: "USD", 
                                    value: price
                                }
                            }],
                            application_context: {
                                shipping_preference: "NO_SHIPPING",
                                locale: "es-CO",
                                payee_preferred: "UNRESTRICTED"
                            },
                            payer: {
                                address: {
                                    country_code: "CO"
                                }
                            }
                        });
                    },
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                            let startDate= checkIn.selectedDates[0];
                            let endDate= checkOut.selectedDates[0];
                        
                            endDate.setDate(endDate.getDate() + 1);
                        
                            let formattedStartDate= startDate.toISOString().split('T')[0];
                            let formattedEndDate= endDate.toISOString().split('T')[0];
                        
                            let roomId= document.getElementById('roomType').value;
                        
                            if (roomId=== "0") {
                                alert("Por favor, selecciona una habitación.");
                                return;
                            }
                        
                            let newEvent= {
                                title: `Habitación ${roomId}`,
                                start: formattedStartDate,
                                end: formattedEndDate,
                                roomId: roomId,
                                color: getRandomColor(),
                            };
                        
                            calendar.addEvent(newEvent);

                            paymentModal.classList.remove("visible");
                            appearPrintReservationModal()
                        });
                    },
                    onError: function(err) {
                        console.error('Error during payment:', err);
                    },
                    funding: {
                        allowed: [paypal.FUNDING.CREDIT, paypal.FUNDING.CARD]
                    }
                }).render("#paypal-button-container"); 
            }
            closePaymentModal.addEventListener("click", function(){
                paymentModal.classList.remove("visible");
            })

            function getAvailableRooms(startDate, endDate) {
                let occupiedRooms= new Set();

                let events= calendar.getEvents();
                console.log("All events: ", events);

                startDate= startDate.split('T')[0];
                endDate= endDate.split('T')[0];

                let adjustedEndDate= new Date(endDate);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                adjustedEndDate= adjustedEndDate.toISOString().split('T')[0];

                events.forEach(event=> {
                    let eventStart= event.start.toISOString().split('T')[0];
                    let eventEnd= event.end ? event.end.toISOString().split('T')[0] : eventStart;

                    console.log("Checking overlap: ", { eventStart, eventEnd, startDate, adjustedEndDate });

                    if ((startDate < eventEnd && adjustedEndDate > eventStart)) {
                        occupiedRooms.add(parseInt(event.extendedProps.roomId));
                    }
                });

                let allRooms= [1, 2, 3];
                return allRooms.filter(roomId=> !occupiedRooms.has(roomId));
            }
            const reserveButton= document.querySelector(".reserve");

            reserveButton.addEventListener('click', function() {
                fechaEntrada= checkIn.formatDate(checkIn.selectedDates[0], "l, d \\de F \\de Y");
                fechaSalida= checkOut.formatDate(checkOut.selectedDates[0], "l, d \\de F \\de Y");
                appearReservationDataModal();
                
                document.querySelector('.create-reservation').classList.remove('visible');
                
            });

            const printReserveButton= document.querySelector(".print-reserve");

            printReserveButton.addEventListener('click', function() {
                printReservation();
                printReservationModal.classList.remove("visible");
                
            });

            const payReserveButton= document.querySelector(".pay-reserve");

            payReserveButton.addEventListener('click', function() {
                if(document.querySelector("#accept-terms").checked == false){
                    alert("Por favor, acepta los términos y condiciones.");
                    return;
                }
                termsReservationModal.classList.remove("visible");
                appearPaymentModal(toPay / 2);
            });

            const termsReservationModal= document.querySelector(".terms-reservation");
            const closeTermsReservationModal= termsReservationModal.querySelector(".close");
            function appearTermsReservationModal(){
                termsReservationModal.classList.add("visible");
            }

            closeTermsReservationModal.addEventListener("click", function(){
                termsReservationModal.classList.remove("visible");
            })
        
            const termsReserveButton= document.querySelector(".terms-reserve");

            termsReserveButton.addEventListener('click', function() {
                document.querySelector("#accept-terms").checked= false;
                toPay= total.value.replace(/^\D+/g, '');
                appearTermsReservationModal();
                document.querySelector("#price-of-reserve").innerText= `$ ${toPay / 2}`;
                document.querySelector(".terms-reservation .modal-body .terms").scrollTop= 0
                nombreReserva= document.querySelector("#nombreReserva").value
                documentoReserva= document.querySelector("#documentoReserva").value
                celularReserva= document.querySelector("#celularReserva").value
                correoReserva= document.querySelector("#correoReserva").value
                document.querySelector("#nombreReserva").value= ""
                document.querySelector("#documentoReserva").value= ""
                document.querySelector("#celularReserva").value= ""
                document.querySelector("#correoReserva").value= ""
                document.querySelector('.data-reservation').classList.remove('visible');
                
            });
            roomSelect.addEventListener("change", function(){
                getDaysBetweenDates();
                room= parseInt(roomSelect.value);
                console.log("Room selected: ", room, "days: ", reservationDays);
                total.value= `$ ${roomPrices[room] * reservationDays}`;
            })
            checkIn.config.onChange.push(function(selectedDates, dateStr, instance) {
                let availableRooms= getAvailableRooms(checkIn.selectedDates[0].toISOString(), checkOut.selectedDates[0].toISOString());

                if(availableRooms.length=== 0) {
                    roomSelect.innerHTML= '<option value="0" disabled hidden selected>No hay habitaciones disponibles para esta fecha</option>'; // Reset
                }else{
                    roomSelect.innerHTML= '<option value="0" disabled hidden selected>Seleccionar</option>'; // Reset
                    availableRooms.forEach(roomId=> {
                        roomSelect.innerHTML+= `<option value="${roomId}">Habitación ${roomId}</option>`;
                    });
                }

                total.value= "$ 0"
            });
            
            checkOut.config.onChange.push(function(selectedDates, dateStr, instance) {
                let availableRooms= getAvailableRooms(checkIn.selectedDates[0].toISOString(), checkOut.selectedDates[0].toISOString());

                if(availableRooms.length=== 0) {
                    roomSelect.innerHTML= '<option value="0" disabled hidden selected>No hay habitaciones disponibles para esta fecha</option>'; // Reset
                }else{
                    roomSelect.innerHTML= '<option value="0" disabled hidden selected>Seleccionar</option>'; // Reset
                    availableRooms.forEach(roomId=> {
                        roomSelect.innerHTML+= `<option value="${roomId}">Habitación ${roomId}</option>`;
                    });
                }

                total.value= "$ 0"
            });

            function getDaysBetweenDates() {
                if (checkIn.selectedDates.length === 0 || checkOut.selectedDates.length === 0) {
                    return 0;
                }
            
                let checkInDate = checkIn.selectedDates[0];
                let checkOutDate = checkOut.selectedDates[0];
            
                let differenceInTime = checkOutDate - checkInDate;
                let differenceInDays = differenceInTime / (1000 * 3600 * 24);
            
                reservationDays= differenceInDays + 1;
            }
            

            paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '20.00'
                            }
                        }],
                        application_context: {
                            shipping_preference: "NO_SHIPPING"
                        }
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        let startDate= checkIn.selectedDates[0];
                        let endDate= checkOut.selectedDates[0];
                    
                        endDate.setDate(endDate.getDate() + 1);
                    
                        let formattedStartDate= startDate.toISOString().split('T')[0];
                        let formattedEndDate= endDate.toISOString().split('T')[0];
                    
                        let roomId= document.getElementById('roomType').value;
                    
                        if (roomId=== "0") {
                            alert("Por favor, selecciona una habitación.");
                            return;
                        }
                    
                        let newEvent= {
                            title: `Habitación ${roomId}`,
                            start: formattedStartDate,
                            end: formattedEndDate,
                            roomId: roomId,
                            color: getRandomColor(),
                        };
                    
                        calendar.addEvent(newEvent);

                        paymentModal.classList.remove("visible");
                    });
                },
                onError: function(err) {
                    console.error('Error during payment:', err);
                },
                funding: {
                    allowed: [paypal.FUNDING.CREDIT, paypal.FUNDING.CARD]
                }
            }).render('#paypal-button-container');
        }
    });
});
if(!(window.location.pathname== "/" || window.location.pathname== "" || window.location.pathname== "/index.html")){
    let section= window.location.pathname.replace(".html", "");
    document.querySelector(`nav a#${routesInverse[section]}-link`).click();
}
//Auto scroll del contenido para mayor visibilidad
function autoScrollHeaderTop(){
    container.querySelector("header").scrollIntoView({ "behavior": "smooth", inline: "center", block: "start" }) 
}
function autoScrollHeaderBottom(mode){
    if(typeof mode != "undefined"){
        if(mode == "abrupt"){
            container.querySelector("header nav").scrollIntoView({ "behavior": "auto", inline: "center", block: "end" })
            return
        }
    }
    container.querySelector("header nav").scrollIntoView({ "behavior": "smooth", inline: "center", block: "end" }) 
}

if(["/", ""].includes(window.location.pathname))autoScrollHeaderBottom("abrupt")

document.querySelector(".container-body").addEventListener("scroll", function(){
    autoScrollHeaderTop()
}) 

//Slideshows (Carruseles de imágenes)

const nextImage= document.querySelector(".next-image")
const slideshowContainer= document.querySelector(".slideshow-container")
const slideshowImages= slideshowContainer.querySelectorAll(".slideshow img");
const controls= document.querySelector(".controls");
const slideshowThumbnailImages= controls.querySelectorAll("img");
const slideshowThumbnailsFiltered= Array.from(slideshowThumbnailImages);
    nextImage.addEventListener("mouseup", function () {
    index= slideshowContainer.getAttribute("data-index")
    index++
    if (index > slideshowImages.length - 1) {
        index= 0
    }
    slideshowContainer.setAttribute("data-index", index)
    slideshowImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest" })
    controls.querySelector(".active").classList.remove("active")
    slideshowThumbnailImages[index].classList.add("active")
    slideshowThumbnailImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest" })
})
const prevImage= document.querySelector(".prev-image")
prevImage.addEventListener("mouseup", function () {
    index= slideshowContainer.getAttribute("data-index")
    index--
    if (index < 0) {
        index= slideshowImages.length - 1
    }
    slideshowContainer.setAttribute("data-index", index)
    slideshowImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest" })
    controls.querySelector(".active").classList.remove("active")
    slideshowThumbnailImages[index].classList.add("active")
    slideshowThumbnailImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest" })
})

slideshowThumbnailImages.forEach(im=>{
    im.addEventListener("click", function(ev){
        let index= Array.prototype.indexOf.call(ev.target.parentNode.children, ev.target);
        slideshowContainer.setAttribute("data-index", index)
        slideshowImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest" })
        controls.querySelector(".active").classList.remove("active")
        slideshowThumbnailImages[index].classList.add("active")
        slideshowThumbnailImages[index].scrollIntoView({ "behavior": "smooth", inline: "center", block: "nearest"})
    })
})
const scrollRightControls= document.querySelector(".scroll-right-controls")
const scrollLeftControls= document.querySelector(".scroll-left-controls")
let intervalScroll= null;
let intervalThumbnails= null
scrollLeftControls.addEventListener("mouseenter", function () {
    clearInterval(intervalScroll)
    intervalScroll= setInterval(function(){
        controls.scrollLeft-= 1
    }, 2)
})
scrollRightControls.addEventListener("mouseenter", function () {
    clearInterval(intervalScroll)
    intervalScroll= setInterval(function(){
        controls.scrollLeft+= 1
    }, 2)
})
scrollLeftControls.addEventListener("mouseleave", function () {
    clearInterval(intervalScroll)
})
scrollRightControls.addEventListener("mouseleave", function () {
    clearInterval(intervalScroll)
})

const reservationModal= document.querySelector(".create-reservation");
const closeReservationModal= reservationModal.querySelector(".close");

function appearReservationModal(){
    reservationModal.classList.add("visible");
    total.value= "$ 0"
}
closeReservationModal.addEventListener("click", function(){
    reservationModal.classList.remove("visible");
})


function printReservation() {
    const printContent = document.querySelector(".preview").innerHTML;
    
    // Open a new popup window
    const printWindow = window.open("", "_blank", "width=600,height=800");

    // Write the content inside the new window
    printWindow.document.write(`
        <html>
            <head>
                <title>Imprimir Reserva</title>
                <style>
                    .preview{
                        flex-grow: 1;
                        flex-shrink: 1;
                        height: 300px;
                        overflow-y: auto;
                        & > div{
                            border: 3px double black;
                            padding: 0.2em;
                            & i, & small{
                                display: block;
                                text-align: center;
                            }
                            & figure{
                                display: flex;
                                justify-content: center;
                                & img{
                                    width: 80%;
                                    height: auto;
                                }
                           
                            }
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    };
                <\/script>
            </body>
        </html>
    `);

    printWindow.document.close(); // Close document writing stream
}

const printReservationModal= document.querySelector(".print-reservation");
const closePrintReservationModal= printReservationModal.querySelector(".close");

function appearPrintReservationModal(){
    document.querySelector("#nombreReservaPreview").innerHTML= `<b>${nombreReserva}</b>`
    document.querySelector("#documentoReservaPreview").innerHTML= `<b>${documentoReserva}</b>`
    document.querySelector("#celularReservaPreview").innerHTML= `<b>${celularReserva}</b>`
    document.querySelector("#correoReservaPreview").innerHTML= `<b>${correoReserva}</b>`
    document.querySelector("#fechaEntradaPreview").innerHTML= `<b>${fechaEntrada}</b>`
    document.querySelector("#fechaSalidaPreview").innerHTML= `<b>${fechaSalida}</b>`
    document.querySelector("#habitacionPreview").innerHTML= `<b>Habitación ${room}</b>`
    document.querySelector("#totalPreview").innerHTML= `<b>${total.value}</b>`
    document.querySelector("#payedPreview").innerHTML= `<b>$ ${toPay / 2}</b>`
    document.querySelector("#toPayPreview").innerHTML= `<b>$ ${toPay / 2}</b>`

    printReservationModal.classList.add("visible");
}
closePrintReservationModal.addEventListener("click", function(){
    printReservationModal.classList.remove("visible");
})

const contactRadios= document.querySelectorAll("input[name='answer']");

contactRadios.forEach(radio=> {
    radio.addEventListener("change", function(){
        if(this.value=== "phone"){
            document.querySelector(".optionsForPhone").classList.add("visible");
            document.querySelector("#emailAddress").classList.remove("visible");
            document.querySelector(".send-message .buttons").classList.remove("visible");
        }else{
            document.querySelector(".optionsForPhone").classList.remove("visible");
            document.querySelector("#phoneNumber").classList.remove("visible");
            contactPhoneRadios.forEach(radio=> {
                radio.checked= false;
            })
            document.querySelector("#emailAddress").classList.add("visible");
            document.querySelector(".send-message .buttons").classList.add("visible");

        }
    });
});

const contactPhoneRadios= document.querySelectorAll("input[name='answerPhone']");

contactPhoneRadios.forEach(radio=> {
    radio.addEventListener("change", function(){
        document.querySelector("#phoneNumber").classList.add("visible");
        document.querySelector(".send-message .buttons").classList.add("visible");
    });
});

const openWhatsappModal= document.querySelector("#open-whatsapp-modal");
const openInstagramModal= document.querySelector("#open-instagram-modal");
const whatsappModal= document.querySelector(".whatsapp-contact")
const whatsappModalClose= whatsappModal.querySelector(".close")
const instagramModal= document.querySelector(".instagram-contact")
const instagramModalClose= instagramModal.querySelector(".close")

openWhatsappModal.addEventListener("click", function(){
    document.querySelector(".modal.visible")?.classList.remove("visible");
    whatsappModal.classList.add("visible");
});

whatsappModalClose.addEventListener("click", function(){
    whatsappModal.classList.remove("visible");
});

openInstagramModal.addEventListener("click", function(){
    document.querySelector(".modal.visible")?.classList.remove("visible");
    instagramModal.classList.add("visible");
});

instagramModalClose.addEventListener("click", function(){
    instagramModal.classList.remove("visible");
});

const abrirCalendario= document.querySelector("#abrir-calendario")

abrirCalendario.addEventListener("click", function(){
    document.querySelector("#reservas-link").click();
});
})

