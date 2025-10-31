package org.recordapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;

@OpenAPIDefinition(info = @Info(title = "Record API", version = "1.0", description = "レコード情報を管理するREST API"))
@SpringBootApplication
@ComponentScan(basePackages = "org.recordapi") // ← controller, service, repository すべて含む
public class RecordApiApplication {

    @Value("${server.port}")
    private String serverPort;

    public static void main(String[] args) {
        SpringApplication.run(RecordApiApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void printPort() {
        System.out.println(">>> server.port = " + serverPort);
    }
}