import { Server, ServerStatus } from "./types";

const models = [
  "Dell PowerEdge R740",
  "HPE ProLiant DL380 Gen10",
  "Inspur NF5280M5",
  "Lenovo ThinkSystem SR650",
  "Huawei FusionServer Pro 2288H V5"
];

const locations = [
  "Rack A-01", "Rack A-02", "Rack B-05", "Rack C-10", "Rack D-12",
  "Rack E-03", "Rack F-08", "Rack G-15", "Rack H-20", "Rack I-01"
];

const accessoryNames = [
  "32GB DDR4 RAM", "64GB DDR4 RAM", "1TB NVMe SSD", "2TB SAS HDD",
  "NVIDIA T4 GPU", "10GbE NIC", "8GB HBA Card", "Intel Xeon Gold 6240"
];

const generateMockServers = (count: number): Server[] => {
  const servers: Server[] = [];
  for (let i = 1; i <= count; i++) {
    const sn = `SN${String(i).padStart(8, '0')}`;
    const model = models[i % models.length];
    const location = locations[i % locations.length];
    const status = i % 5 === 0 ? ServerStatus.RECONFIGURING : ServerStatus.PENDING;
    
    const accessories = [];
    const accCount = 2 + (i % 3);
    for (let j = 1; j <= accCount; j++) {
      accessories.push({
        id: `a-${i}-${j}`,
        name: accessoryNames[(i + j) % accessoryNames.length],
        type: j % 3 === 0 ? "remove" : "install",
        quantity: 1 + (j % 2),
        status: "pending" as const
      });
    }

    servers.push({
      id: String(i),
      sn,
      model,
      status,
      location,
      accessories,
    });
  }
  return servers;
};

export const mockServers: Server[] = generateMockServers(53);
