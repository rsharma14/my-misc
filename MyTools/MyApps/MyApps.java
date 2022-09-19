import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class MyApps {

	private ClassLoader classLoader = this.getClass().getClassLoader();

	private List<MyPojo> tools = readFile("apps.txt");


	List<String> selected = tools.stream().filter(a -> a.getIsDefault()).map(MyPojo::getLoc)
			.collect(Collectors.toList());

	MyApps() {

		JFrame f = new JFrame("My Tools");
		final JLabel label = new JLabel();
		label.setHorizontalAlignment(JLabel.CENTER);
		label.setSize(400, 100);
		label.setBounds(120, 260, 200, 30);
		int x = 10, y = 10, iy = 50;
		JCheckBox jcheckbox = null;

		JPanel mainPanel = new JPanel(); // main panel
		//mainPanel.setBackground(Color.white);
		mainPanel.setBorder(BorderFactory.createLineBorder(Color.black, 1));
		mainPanel.setBounds(1,1,370,200);


		for (MyPojo cb : tools) {
			jcheckbox = new JCheckBox(cb.getName());
			jcheckbox.setName(cb.getLoc());
			jcheckbox.setSelected(cb.getIsDefault());
			//jcheckbox.setBounds(x, y, 100, 30);
			//y += iy;
			mainPanel.add(jcheckbox);
			jcheckbox.addItemListener(new ItemListener() {
				public void itemStateChanged(ItemEvent e) {
					JCheckBox it = (JCheckBox) e.getItem();
					if (e.getStateChange() == 1) {
						selected.add(it.getName());
					} else {
						selected.remove(it.getName());
					}

				}
			});
		}
		f.add(label);

		JButton b = new JButton("Start");
		b.setBounds(150, 300, 95, 30);
		boolean disposeFrame[] = { false };
		b.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				for (String cmd : selected) {
					try {
						System.out.println("starting..."+cmd);
						new ProcessBuilder(Arrays.asList(cmd.split(","))).start();
					} catch (Exception e1) {
						System.out.println(e1.getMessage());
					}
				}
				disposeFrame[0] = true;
				f.dispose();
			}
		});

		f.add(mainPanel);
		f.add(b);

		f.setSize(400, 400);
		f.setLayout(new BorderLayout());
		f.setVisible(true);
		f.addWindowListener(new java.awt.event.WindowAdapter() {
			@Override
			public void windowClosing(java.awt.event.WindowEvent windowEvent) {
				System.exit(0);
			}
		});

		try {
			int sec = 30000; // 30 sec
			while (sec > 0 && !disposeFrame[0]) {
				label.setText("Auto start after:   " + (sec / 1000) + " seconds");
				Thread.sleep(1000);
				sec -= 1000;
			}
			//if (!disposeFrame[0])
			//	b.doClick();
		} catch (InterruptedException e1) {
			e1.printStackTrace();
		}
	}

	public static void main(String args[]) {
		new MyApps();
	}

	private List<MyPojo> readFile(String file) {
		List<MyPojo> links = new ArrayList<>();

		try (BufferedReader br = new BufferedReader(new InputStreamReader(classLoader.getResourceAsStream(file)))) {

			String line = null;
			while ((line = br.readLine()) != null) {
				links.add(new MyPojo(line.split("==")[0].trim(), line.split("==")[1].trim(),
						Boolean.parseBoolean(line.split("==")[2].trim())));
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return links;
	}
}

class MyPojo {
	private String name;
	private String loc;
	private boolean isDefault;

	public MyPojo() {
	}

	public MyPojo(String name, String loc, boolean isDefault) {
		super();
		this.name = name;
		this.loc = loc;
		this.isDefault = isDefault;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLoc() {
		return loc;
	}

	public void setLoc(String loc) {
		this.loc = loc;
	}

	public boolean getIsDefault() {
		return isDefault;
	}

	public void setIsDefault(boolean isDefault) {
		this.isDefault = isDefault;
	}

	@Override
	public String toString() {
		return "MyPojo [name=" + name + ", loc=" + loc + ", isDefault=" + isDefault + "]";
	}

}