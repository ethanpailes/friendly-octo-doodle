#![allow(unused_variables)]

extern crate actix;
extern crate actix_web;
extern crate env_logger;

use actix_web::http::{Method, StatusCode};
use actix_web::{
    fs, middleware, pred, server, App, HttpRequest, HttpResponse, Path, Responder, Result,
};
use std::env;

// index handler
fn index(req: &HttpRequest) -> Result<fs::NamedFile> {
    Ok(fs::NamedFile::open("../client/dist/index.html")?)
}

// eat food handler
fn eat_food(info: Path<(String, u32)>) -> impl Responder {
    format!("Player {} ate food with id:{}", info.0, info.1)
}

// new food handler
fn new_food(req: &HttpRequest) -> Result<HttpResponse> {
    println!("new food is available/not");
    Ok(HttpResponse::Ok().into())
}

/// favicon handler
fn favicon(req: &HttpRequest) -> Result<fs::NamedFile> {
    Ok(fs::NamedFile::open("../client/favicon.ico")?)
}

/// 404 handler
fn p404(req: &HttpRequest) -> Result<fs::NamedFile> {
    Ok(fs::NamedFile::open("../client/static/404.html")?.set_status_code(StatusCode::NOT_FOUND))
}

fn main() {
    env::set_var("RUST_LOG", "actix_web=debug");
    env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();
    let sys = actix::System::new("basic-example");
    let food_id = "1234567890";

    let addr = server::new(|| {
        App::new()
            // enable logger
            .middleware(middleware::Logger::default())
            // register favicon
            .resource("/favicon", |r| r.f(favicon))
            // static files
            .handler("/dist", fs::StaticFiles::new("../client/dist").unwrap())
            // home
            .resource("/", |r| r.f(index))
            // eating and giving food
            .resource("/eat/{player_id}/{food_id}", |r| r.with(eat_food))
            .resource("/new_food", |r| r.get().f(new_food))
            // default
            .default_resource(|r| {
                // 404 for GET request
                r.method(Method::GET).f(p404);

                // all requests that are not `GET`
                r.route()
                    .filter(pred::Not(pred::Get()))
                    .f(|req| HttpResponse::MethodNotAllowed());
            })
    }).bind("127.0.0.1:8080")
    .expect("Can not bind to 127.0.0.1:8080")
    .shutdown_timeout(0) // <- Set shutdown timeout to 0 seconds (default 60s)
    .start();

    println!("Starting http server: 127.0.0.1:8080");
    let _ = sys.run();
}
