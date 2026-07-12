package fr.myway.user;

import java.util.List;

// Sérialisé en snake_case (spring.jackson.property-naming-strategy)
public record UserDto(
        Long id,
        String email,
        String fullName,
        String city,
        List<String> specialties,
        String currentStatus,
        Integer desiredTjm,
        Integer daysPerMonth,
        Double familyShares,
        Integer householdIncome,
        List<String> goals,
        boolean onboardingCompleted,
        String role
) {
    public static UserDto from(UserAccount u) {
        return new UserDto(
                u.getId(), u.getEmail(), u.getFullName(), u.getCity(),
                u.getSpecialties(), u.getCurrentStatus(), u.getDesiredTjm(),
                u.getDaysPerMonth(), u.getFamilyShares(), u.getHouseholdIncome(),
                u.getGoals(), u.isOnboardingCompleted(), u.getRole()
        );
    }
}
