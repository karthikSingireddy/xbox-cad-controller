use gilrs::{Axis, Event, EventType, Gilrs};

use std::thread;

use std::time::{Duration, Instant};

use actix::prelude::*;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_millis(10);
/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

static mut CONTROLLER_STATE: ControllerState = ControllerState {
    left_x: 0.0,
    left_y: 0.0,
    right_x: 0.0,
    right_y: 0.0,
    right_trigger: 0.0,
    left_trigger: 0.0
};

struct ControllerState {
    left_x: f32,
    left_y: f32,
    right_x: f32,
    right_y: f32,
    right_trigger: f32,
    left_trigger: f32
}

/// do websocket handshake and start `MyWebSocket` actor
async fn ws_index(r: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    println!("{:?}", r);
    let res = ws::start(MyWebSocket::new(), &r, stream);
    println!("{:?}", res);
    res
}

/// websocket connection is long running connection, it easier
/// to handle with an actor
struct MyWebSocket {
    /// Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    /// otherwise we drop connection.
    hb: Instant,
}

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;

    /// Method is called on actor start. We start the heartbeat process here.
    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
    }
}

/// Handler for `ws::Message`
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        // process websocket messages
        println!("WS: {:?}", msg);
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.hb = Instant::now();
            }
            Ok(ws::Message::Text(text)) => ctx.text(text),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

impl MyWebSocket {
    fn new() -> Self {
        Self { hb: Instant::now() }
    }

    /// helper method that sends ping to client every second.
    ///
    /// also this method checks heartbeats from client
    fn hb(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");

            ctx.text(get_controller_values());

            // unsafe {
            //     ctx.text(format!(
            //         "xbox controller data: {:?} {:?}",
            //         CONTROLLER_STATE.left_x, CONTROLLER_STATE.left_y
            //     ));
            // }

            // get_controller_values();
        });
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let _controller_thread_handle = thread::spawn(controller_thread);

    std::env::set_var("RUST_LOG", "actix_server=info,actix_web=info");
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            // enable logger
            .wrap(middleware::Logger::default())
            // websocket route
            .service(web::resource("/ws/").route(web::get().to(ws_index)))
        // static files
        // .service(fs::Files::new("/", "static/").index_file("index.html"))
    })
    // start http server on 127.0.0.1:8080
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

// struct State {
//     connections: WebSocketContext<MyWebSocket>,
// }

// controller testing stuff
fn controller_thread() {
    println!("test\n\n\n\\n");

    let mut gilrs = Gilrs::new().unwrap();

    for (_id, gamepad) in gilrs.gamepads() {
        println!("{} is {:?}", gamepad.name(), gamepad.power_info());
    }

    // let mut active_gamepad = None;

    loop {
        // Examine new events
        while let Some(Event { id, event, time }) = gilrs.next_event() {
            println!("{:?} New event from {}: {:?}", time, id, event);
            // active_gamepad = Some(id);

            match event {
                EventType::AxisChanged(axis, val, code) => {
                    println!("axis changed");
                    unsafe {
                        match axis {
                            Axis::LeftStickX => CONTROLLER_STATE.left_x = val,
                            Axis::LeftStickY => CONTROLLER_STATE.left_y = val,
                            Axis::LeftZ => (),
                            Axis::RightStickX => CONTROLLER_STATE.right_x = val,
                            Axis::RightStickY => CONTROLLER_STATE.right_y = val,
                            Axis::RightZ => (),
                            Axis::DPadX => (),
                            Axis::DPadY => (),
                            Axis::Unknown => (),
                        };
                    }
                }
                EventType::ButtonChanged(button, val, code) => {
                    println!("button changed");
                    unsafe {
                        match button {
                            gilrs::Button::South => (),
                            gilrs::Button::East => (),
                            gilrs::Button::North => (),
                            gilrs::Button::West => (),
                            gilrs::Button::C => (),
                            gilrs::Button::Z => (),
                            gilrs::Button::LeftTrigger => (),
                            gilrs::Button::LeftTrigger2 => CONTROLLER_STATE.left_trigger = val,
                            gilrs::Button::RightTrigger => (),
                            gilrs::Button::RightTrigger2 => CONTROLLER_STATE.right_trigger = val,
                            gilrs::Button::Select => (),
                            gilrs::Button::Start => (),
                            gilrs::Button::Mode => (),
                            gilrs::Button::LeftThumb => (),
                            gilrs::Button::RightThumb => (),
                            gilrs::Button::DPadUp => (),
                            gilrs::Button::DPadDown => (),
                            gilrs::Button::DPadLeft => (),
                            gilrs::Button::DPadRight => (),
                            gilrs::Button::Unknown => (),
                        }
                    }
                }
                EventType::ButtonReleased(axis, code) => {
                    println!("button released");
                }
                EventType::ButtonRepeated(axis, code) => {
                    println!("button repeated");
                }
                EventType::ButtonPressed(axis, code) => {
                    println!("button pressed");
                }
                EventType::Connected => todo!(),
                EventType::Disconnected => todo!(),
                EventType::Dropped => todo!(),
            };
        }

        // You can also use cached gamepad state
        // if let Some(gamepad) = active_gamepad.map(|id| gilrs.gamepad(id)) {
        //     if gamepad.is_pressed(Button::South) {
        //         println!("Button South is pressed (XBox - A, PS - X)");
        //     }
        // }
        // unsafe {
        //     CONTROLLER_STATE.left_x += 0.1;
        //     println!("Controller left_x: {}", CONTROLLER_STATE.left_x);
        // }

        // unsafe {
        //     println!(
        //         "Controller left_x: {}, Controller left_y: {}",
        //         CONTROLLER_STATE.left_x, CONTROLLER_STATE.left_y
        //     );
        // }
    }
}

fn get_controller_values() -> String {
    unsafe {
        format!(
            "{{\"data\": {{ \"leftX\": {}, \"leftY\": {}, \"rightX\": {}, \"rightY\": {}, \"leftTrigger\": {}, \"rightTrigger\": {} }} }}",
            CONTROLLER_STATE.left_x, CONTROLLER_STATE.left_y, 
            CONTROLLER_STATE.right_x, CONTROLLER_STATE.right_y, 
            CONTROLLER_STATE.left_trigger, CONTROLLER_STATE.right_trigger
        )
    }
}
