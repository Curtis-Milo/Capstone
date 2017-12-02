%model Param

h=0.5; %0.5m high
g=9.8; %m/s^2
rho =1; %fluid density
A = pi*(0.00635)^2;
v_pump = 5;
T_fluid = 20;
T_fluidmin = 25;
M_amount  =10;
M_min = 3.75;

%Motor Parameters
R = 2.0;                % Ohms
L = 0.5;                % Henrys
Km = 1;               % torque constant
Kb = 1;               % back emf constant
Kf = 0.2;               % Nms
J = 0.02;               % kg.m^2/s^2
