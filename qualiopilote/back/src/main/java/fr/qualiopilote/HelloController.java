package fr.qualiopilote;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Endpoint de démonstration : GET /api/hello. */
@RestController
public class HelloController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello World depuis le back-end Qualiopilote 👋");
    }
}
