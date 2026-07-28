import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/doreamon";
        String user = "sparrow";
        String password = "qlljvr9ly";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
             
            System.out.println("Tables in doreamon database:");
            boolean found = false;
            while (rs.next()) {
                System.out.println("- " + rs.getString(1));
                found = true;
            }
            if (!found) {
                System.out.println("(No tables found)");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
