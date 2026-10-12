package com.tutly.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String city;
    private String description;

}
